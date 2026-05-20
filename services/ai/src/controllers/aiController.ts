import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { GeminiService } from '../services/geminiService';
import { GenerateQuizRequest } from '../types/express';

// Ensure environment variables are loaded
dotenv.config();

const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');

/**
 * Generate quiz questions from lesson content
 * POST /api/ai/generate-quiz
 */
export const generateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { lessonContent, numQuestions, difficulty }: GenerateQuizRequest = req.body;

    // Validate lesson content
    if (!lessonContent || lessonContent.trim().length < 50) {
      res.status(400).json({
        success: false,
        error: 'Lesson content is too short. Minimum 50 characters required.'
      });
      return;
    }

    // Set defaults
    const questionsCount = numQuestions || parseInt(process.env.DEFAULT_NUM_QUESTIONS || '10');
    const difficultyLevel = difficulty || (process.env.DEFAULT_DIFFICULTY as 'easy' | 'medium' | 'hard') || 'medium';

    // Validate number of questions
    const maxQuestions = parseInt(process.env.MAX_NUM_QUESTIONS || '20');
    if (questionsCount < 1 || questionsCount > maxQuestions) {
      res.status(400).json({
        success: false,
        error: `Number of questions must be between 1 and ${maxQuestions}`
      });
      return;
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
      res.status(400).json({
        success: false,
        error: 'Difficulty must be: easy, medium, or hard'
      });
      return;
    }

    console.log(`📝 Generating quiz: ${questionsCount} questions, difficulty: ${difficultyLevel}`);

    // Generate quiz using Gemini
    const questions = await geminiService.generateQuiz(
      lessonContent,
      questionsCount,
      difficultyLevel
    );

    // Check if we got enough questions
    if (questions.length === 0) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate valid questions. Please try again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      questions,
      metadata: {
        generated: questions.length,
        requested: questionsCount,
        difficulty: difficultyLevel
      }
    });
  } catch (error: any) {
    console.error('❌ Quiz generation error:', error);
    next(error);
  }
};

/**
 * Test Gemini API connection
 * GET /api/ai/test
 */
export const testConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isConnected = await geminiService.testConnection();

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Gemini API connection successful',
        model: geminiService.getModelName()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to connect to Gemini API'
      });
    }
  } catch (error: any) {
    next(error);
  }
};
