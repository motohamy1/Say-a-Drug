// Validation middleware for common input validation
export const validateSearchQuery = (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query parameter "q" is required'
    });
  }
  
  if (typeof q !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Search query parameter "q" must be a string'
    });
  }
  
  if (q.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query parameter "q" cannot be empty'
    });
  }
  
  if (q.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query parameter "q" is too long'
    });
  }
  
  next();
};

export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      status: 'error',
      message: 'Page must be a positive integer'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Limit must be between 1 and 100'
    });
  }
  
  // Add validated values to request
  req.pagination = {
    page: pageNum,
    limit: limitNum
  };
  
  next();
};

export const validateDosageRequest = (req, res, next) => {
  const { drugName, age, weight, category } = req.body;
  
  // Validate required fields
  if (!drugName) {
    return res.status(400).json({
      status: 'error',
      message: 'Drug name is required'
    });
  }
  
  if (typeof drugName !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Drug name must be a string'
    });
  }
  
  // Validate age if provided
  if (age !== undefined && age !== null) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({
        status: 'error',
        message: 'Age must be a valid number between 0 and 150'
      });
    }
    req.body.age = ageNum;
  }
  
  // Validate weight if provided
  if (weight !== undefined && weight !== null) {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'Weight must be a valid positive number'
      });
    }
    req.body.weight = weightNum;
  }
  
  // Validate category if provided
  if (category) {
    const validCategories = ['pediatric', 'geriatric', 'pregnancy', 'renal', 'hepatic'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }
    req.body.category = category.toLowerCase();
  }
  
  next();
};

export const validateChatMessage = (req, res, next) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      status: 'error',
      message: 'Message is required'
    });
  }
  
  if (typeof message !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Message must be a string'
    });
  }
  
  if (message.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Message cannot be empty'
    });
  }
  
  if (message.length > 2000) {
    return res.status(400).json({
      status: 'error',
      message: 'Message is too long'
    });
  }
  
  next();
};