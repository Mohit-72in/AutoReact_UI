const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require('@google/genai');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const execExecute = promisify(exec);

/**
 * Gemini AI Agent Service
 * Implements function calling for website generation
 */
class GeminiAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.history = [];
    this.availableTools = {
      executeCommand: this.executeCommand.bind(this),
      writeFile: this.writeFile.bind(this),
    };
  }

  /**
   * Quickly verify the API key works by calling a lightweight endpoint.
   * Returns true if valid or false if an error occurs (invalid key, etc.).
   */
  async verifyKey() {
    try {
      // perform a minimal request (list models) to confirm key validity
      await this.genAI.models.list({});
      return true;
    } catch (err) {
      console.error('🔑 Gemini API key verification failed:', err.message);
      return false;
    }
  }

  /**
   * Execute shell command
   */
  async executeCommand({ command }) {
    try {
      const { stdout, stderr } = await execExecute(command);
      if (stderr) {
        return `Error: ${stderr}`;
      }
      return `Success: ${stdout} || Task completed successfully.`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  /**
   * Write content to file
   */
  async writeFile({ path: filePath, content }) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return `Wrote ${content.length} bytes to ${filePath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  /**
   * Tool declarations for Gemini
   */
  getToolDeclarations() {
    return [
      {
        name: 'executeCommand',
        description: 'Execute a single terminal/shell command. Can create folders, files, or perform file operations.',
        parameters: {
          type: 'OBJECT',
          properties: {
            command: {
              type: 'STRING',
              description: 'A single terminal command, e.g., "mkdir calculator"',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'writeFile',
        description: 'Write the given string into a file. Creates the file if it does not exist.',
        parameters: {
          type: 'OBJECT',
          properties: {
            path: {
              type: 'STRING',
              description: 'Path of the file to write',
            },
            content: {
              type: 'STRING',
              description: 'Text to put into the file',
            },
          },
          required: ['path', 'content'],
        },
      },
    ];
  }

  /**
   * Run the agent with a user prompt
   */
  async run(userPrompt, existingHistory = []) {
    // Initialize or use existing history
    this.history = existingHistory.length > 0 ? existingHistory : [];
    
    // Add user message
    this.history.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const platform = os.platform();
    const responses = [];
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iterations < maxIterations) {
      iterations++;

      try {
        const responseObj = await this.genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: this.history,
          systemInstruction: `You are a website builder expert. You create beautiful, modern, responsive websites using HTML, CSS, and JavaScript.

Current user operating system is: ${platform}.

You have access to two tools:
• executeCommand – run a single shell command (mkdir, cd, etc.)
• writeFile – write content into a file

Guidelines:
1. Create clean, modern, responsive designs
2. Use Tailwind CSS CDN for styling
3. Write all code in one HTML file when possible
4. Use writeFile for creating HTML/CSS/JS files
5. Organize files properly (create folders as needed)
6. Test that all resources are properly linked
7. Return only the component code, not explanations

When creating files, use writeFile tool with full HTML structure.`,
          tools: [
            {
              functionDeclarations: this.getToolDeclarations(),
            },
          ],
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

        const parts = responseObj.candidates[0].content.parts;
        const functionCallPart = parts.find((p) => p.functionCall);

        if (functionCallPart) {
          // AI wants to call a function
          const { name, args } = functionCallPart.functionCall;
          
          console.log(`🔧 Calling tool: ${name}`, args);
          responses.push({ type: 'tool_call', tool: name, args });

          // Execute the function
          const funCall = this.availableTools[name];
          const result = await funCall(args);

          console.log(`✅ Tool result: ${result}`);
          responses.push({ type: 'tool_result', result });

          // Add function call and response to history
          this.history.push({
            role: 'model',
            parts: [functionCallPart],
          });

          this.history.push({
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: name,
                  response: { result },
                },
              },
            ],
          });
        } else {
          // AI is done, get final response
          const finalText = parts.map((p) => p.text ?? '').join('');
          
          this.history.push({
            role: 'model',
            parts: [{ text: finalText }],
          });

          console.log('🎉 Agent completed:', finalText);
          responses.push({ type: 'final', text: finalText });
          
          return {
            success: true,
            responses,
            finalMessage: finalText,
            history: this.history,
          };
        }
      } catch (error) {
        console.error('❌ Agent error:', error);
        return {
          success: false,
          error: error.message,
          responses,
        };
      }
    }

    return {
      success: false,
      error: 'Max iterations reached',
      responses,
    };
  }

  /**
   * Generate simple React component (compatibility with existing API)
   */
  async generateComponent(prompt) {
    const result = await this.run(
      `Create a React component with Tailwind CSS based on this description: ${prompt}. 
      
      Return ONLY the JSX component code in a single code block, nothing else.`
    );

    if (result.success && result.finalMessage) {
      // Extract code from markdown code blocks if present
      const codeMatch = result.finalMessage.match(/```(?:jsx|javascript|js)?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : result.finalMessage;

      return {
        code: code.trim(),
        message: 'Component generated successfully!',
      };
    } else {
      throw new Error(result.error || 'Failed to generate component');
    }
  }
}

module.exports = GeminiAgent;
