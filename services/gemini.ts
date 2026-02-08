
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
          systemInstruction: `You are the IFTU LMS AI Assistant. 
          
          You also represent the 'IFTU IT EDUCATION CENTRE'. 
          Key Services you can provide info on:
          1. **Passport Services**: Assistance with new, renewal, and expired passports. Turnaround ~20 mins.
          2. **Online Form Completion**: Helping with DV lotteries, E-service payments, TeleBirr, and E-money transfers.
          3. **Student Applications**: Assisting with MoE placements, university assignments, and exam locations.
          4. **Result Checking**: Quick access (1 min) to Passport, Grade 12/8/6 exams, and NAGT ID results.
          5. **Training**: Educational support and digital skills training.
          
          Contact Info:
          - Phone: 0995852194, 0903971666, 0715008043
          - Telegram: t.me/jemal9056
          - Email: jemalfano030@gmail.com
          - Location: Near Bajaj Qoree-Shire.
          
          You also help administrators analyze student data and suggest educational improvements. 
          Use Google Search for news/trends.
          You have authority to generate formal Completion Certificates, Transcripts, and GPA summaries in Markdown.`,
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

  async generateEthiopianSyllabus(subject: string, grade: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a structured syllabus for the subject "${subject}" for "${grade}" strictly following the Ethiopian Ministry of Education (MoE) curriculum standards. 
      Break it down into Units (Modules) and Sub-topics (Lessons).
      
      Example structure:
      Unit 1: Introduction to...
       - Lesson 1
       - Lesson 2
      Unit 2: ...
      
      Ensure the content is accurate for the Ethiopian context.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING }, // Just ask AI to generate a random string or index
              title: { type: Type.STRING, description: "The Unit Name (e.g. Unit 1: Mechanics)" },
              lessons: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of specific topics/lessons in this unit"
              }
            },
            required: ["title", "lessons"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error("Failed to parse Ethiopian Curriculum", e);
      return [];
    }
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

  async analyzeGradebook(gradeData: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an academic data analyst. Analyze this gradebook data summary. 
      
      Provide a brief, professional report covering:
      1. **Overall Performance**: General class average and trends.
      2. **Areas for Improvement**: Which subjects or semesters seem harder?
      3. **At-Risk Students**: Identify students (by ID) with averages below 50 who need intervention.
      4. **Top Performers**: Acknowledge students with high averages (>90).
      
      Keep it concise. Use Markdown.
      Data: ${gradeData}`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  }
}

export const geminiService = new GeminiService();
