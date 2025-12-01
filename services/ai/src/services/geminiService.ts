import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizQuestion } from '../types/express';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private modelName: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.5 Flash (latest stable free model, June 2025)
    // Supports up to 1M tokens, fast and versatile
    this.modelName = 'gemini-2.5-flash';

    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.7,
      }
    });
  }

  /**
   * Generate quiz questions from lesson content using Google Gemini AI
   * @param lessonContent - HTML or plain text content of the lesson
   * @param numQuestions - Number of questions to generate (1-20)
   * @param difficulty - Difficulty level (easy, medium, hard)
   * @returns Array of quiz questions with options and correct answers
   */
  async generateQuiz(
    lessonContent: string,
    numQuestions: number = 10,
    difficulty: string = 'medium'
  ): Promise<QuizQuestion[]> {
    try {
      // Clean HTML tags from content for better AI processing
      const cleanContent = this.stripHtml(lessonContent);

      // Truncate content if too long (Gemini has token limits)
      const truncatedContent = cleanContent.substring(0, 10000);

      const prompt = this.buildPrompt(truncatedContent, numQuestions, difficulty);

      console.log(`🤖 Generating ${numQuestions} ${difficulty} questions...`);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log('✅ Gemini response received');

      // Clean up markdown code blocks if present (```json ... ```)
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse JSON response
      const parsedResponse = JSON.parse(text);

      // Validate response structure
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid response format from Gemini API');
      }

      // Validate each question
      const validatedQuestions = this.validateQuestions(parsedResponse.questions);

      console.log(`✅ Generated ${validatedQuestions.length} valid questions`);

      return validatedQuestions;
    } catch (error: any) {
      console.error('❌ Gemini API Error:', error.message);
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  /**
   * Build the prompt for Gemini AI
   */
  private buildPrompt(content: string, numQuestions: number, difficulty: string): string {
    const difficultyInstructions = {
      easy: 'Pitanja treba da budu jednostavna i direktna, pogodna za decu 8-9 godina.',
      medium: 'Pitanja treba da budu umereno zahtevna, pogodna za decu 10-11 godina.',
      hard: 'Pitanja treba da budu kompleksnija i zahtevaju dublje razumevanje, pogodna za decu 12+ godina.'
    };

    return `
Ti si asistent koji generiše kvizove za decu sa posebnim potrebama (disleksija, oštećenje vida).

PRAVILA:
1. Generiši tačno ${numQuestions} pitanja
2. Težina: ${difficulty} - ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.medium}
3. Svako pitanje mora imati 4 opcije (A, B, C, D)
4. Samo jedan tačan odgovor
5. Pitanja moraju biti JASNA, KRATKA i RAZUMLJIVA za decu
6. Koristi JEDNOSTAVAN jezik bez komplikovanih reči
7. Fokusiraj se na KLJUČNE koncepte iz lekcije
8. Izbegavaj dvosmislena pitanja

LEKCIJA:
${content}

OBAVEZNO vrati JSON u ovom formatu (bez dodatnog teksta):
{
  "questions": [
    {
      "question": "Tekst pitanja?",
      "options": ["A) Prvi odgovor", "B) Drugi odgovor", "C) Treći odgovor", "D) Četvrti odgovor"],
      "correctAnswer": "A"
    }
  ]
}

VAŽNO: correctAnswer mora biti samo jedno slovo (A, B, C ili D).
`;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate questions format
   */
  private validateQuestions(questions: any[]): QuizQuestion[] {
    return questions.filter((q: any) => {
      // Check if question has all required fields
      if (!q.question || !q.options || !q.correctAnswer) {
        console.warn('⚠️ Skipping invalid question:', q);
        return false;
      }

      // Check if options is an array with 4 items
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        console.warn('⚠️ Skipping question with invalid options:', q);
        return false;
      }

      // Check if correctAnswer is valid (A, B, C, or D)
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        console.warn('⚠️ Skipping question with invalid correctAnswer:', q);
        return false;
      }

      return true;
    });
  }

  /**
   * Test connection to Gemini API
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello, respond with "OK"');
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini API connection successful:', text);
      return true;
    } catch (error: any) {
      console.error('❌ Gemini API connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get the current model name
   */
  getModelName(): string {
    return this.modelName;
  }
}
