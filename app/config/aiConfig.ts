/**
 * AI Configuration
 * Store your AI API settings here
 */

export const AI_CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_KEY:
    "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", // Add your OpenAI API key here
  OPENAI_API_URL: "https://api.openai.com/v1/chat/completions",

  // Model settings - Start with Mini, upgrade to 4o later if needed
  MODEL: "gpt-4o-mini", // or "gpt-4o"
  model: "gpt-4o-mini", // Keeping both for compatibility
  MAX_TOKENS: 800, // Reduced for shorter responses
  maxTokens: 800, // Keeping both for compatibility
  TEMPERATURE: 0.3, // Lower for more consistent technical responses
  temperature: 0.3, // Keeping both for compatibility
  TIMEOUT: 30000, // 30 seconds
  timeout: 30000, // Keeping both for compatibility

  // System prompt for automotive diagnostics
  SYSTEM_PROMPT: `You are an expert automotive diagnostic assistant. Help mechanics diagnose vehicle problems efficiently.

Be concise and direct:
- Give brief, practical answers
- Use bullet points when listing steps
- Limit to 3-4 diagnostic steps max
- Use simple language
- Keep responses under 150 words
- Focus on most likely causes first

Structure: Analysis → Top 2-3 Steps → Most Likely Cause`,

  // Cost tracking
  costPerInputToken: 0.00015, // Mini pricing
  costPerOutputToken: 0.0006, // Mini pricing

  // Fallback options
  fallbackModel: "gpt-3.5-turbo",
  retryAttempts: 3,

  // API settings (compatibility)
  baseURL: "https://api.openai.com/v1/chat/completions",
};

// Easy model switching
export const switchToFullGPT4o = () => {
  AI_CONFIG.MODEL = "gpt-4o";
  AI_CONFIG.model = "gpt-4o";
  AI_CONFIG.costPerInputToken = 0.005;
  AI_CONFIG.costPerOutputToken = 0.015;
};

/**
 * Validate AI configuration
 * Checks if all required settings are present
 */
export const validateAIConfig = (): boolean => {
  try {
    // Check if API key is provided (for production)
    if (AI_CONFIG.OPENAI_API_KEY && AI_CONFIG.OPENAI_API_KEY.trim() === "") {
      console.warn("OpenAI API key is empty. Using mock responses.");
      return false;
    }

    // Check required fields
    if (!AI_CONFIG.MODEL || !AI_CONFIG.OPENAI_API_URL) {
      console.error("AI Config validation failed: Missing required fields");
      return false;
    }

    // Check if model is supported
    const supportedModels = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];
    if (!supportedModels.includes(AI_CONFIG.MODEL)) {
      console.warn(`Unsupported model: ${AI_CONFIG.MODEL}. Using fallback.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating AI config:", error);
    return false;
  }
};

/**
 * Check if AI integration is ready (has API key)
 */
export const isAIReady = (): boolean => {
  return !!(AI_CONFIG.OPENAI_API_KEY && AI_CONFIG.OPENAI_API_KEY.trim() !== "");
};

/**
 * Get model pricing info
 */
export const getModelPricing = () => {
  return {
    model: AI_CONFIG.MODEL,
    inputCost: AI_CONFIG.costPerInputToken,
    outputCost: AI_CONFIG.costPerOutputToken,
    currency: "USD per 1K tokens",
  };
};
