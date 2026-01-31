
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize GoogleGenAI with the API key from environment variables
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *getLMSInsightStream(query: string) {
    try {
      const response = await this.ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: "You are the IFTU LMS AI Assistant. You help administrators analyze student data, suggest educational improvements, and answer technical questions. Use Google Search for news/trends. You also have the authority to generate formal Completion Certificates, Transcripts, and GPA summaries in Markdown format when requested by a student. Be formal, celebratory, and use professional formatting for these documents. Always cite URLs from grounding chunks.",
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for fast responses
        },
      });

      for await (const chunk of response) {
        yield chunk.text;
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      yield "I encountered an error while processing your request. Please try again later.";
    }
  }

  async getAreaDescription(location: string, lat?: number, lng?: number) {
    // Maps grounding is only supported in Gemini 2.5 series models.
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Describe the academic and professional surroundings of the IFTU campus in ${location}. Mention nearby facilities or points of interest for students.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text, sources };
  }

  // Fix: Added missing method getCurriculumAdvice to handle the error in CoursesView.tsx
  async getCurriculumAdvice(courseTitle: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert curriculum designer. Provide detailed curriculum and syllabus advice for a course titled "${courseTitle}". Suggest 8-12 modules, key learning outcomes, and recommended reading or resources. Format the output in Markdown.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  }

  async generateQuestionsFromText(sourceText: string, count: number = 5) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract or generate ${count} multiple choice questions based on the following content: \n\n${sourceText}`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "The question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Four multiple choice options"
              },
              correctAnswer: { 
                type: Type.INTEGER, 
                description: "Zero-based index of the correct answer"
              }
            },
            required: ["id", "text", "options", "correctAnswer"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error("Failed to parse AI questions", e);
      return [];
    }
  }

  async generateQuestionsFromData(base64Data: string, mimeType: string, count: number = 5) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Extract ${count} multiple choice questions from this document. Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "The question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Four multiple choice options"
              },
              correctAnswer: { 
                type: Type.INTEGER, 
                description: "Zero-based index of the correct answer"
              }
            },
            required: ["id", "text", "options", "correctAnswer"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error("Failed to parse AI questions from file", e);
      return [];
    }
  }

  async summarizeMaterial(title: string, course: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert educational content synthesizer. 
      
      Task: Generate a detailed, structured study summary for a document titled "${title}" used in the course "${course}".
      
      Since this is a simulation, generate a *hypothetical but realistic* summary that covers:
      1. Core Topics likely covered in this resource.
      2. Key Definitions (at least 5).
      3. Critical Formulas or Concepts.
      4. A brief quiz (3 questions) to test understanding.
      
      Format the output in clean Markdown with headers, bullet points, and bold text.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Could not generate summary.";
  }
}

export const geminiService = new GeminiService();
