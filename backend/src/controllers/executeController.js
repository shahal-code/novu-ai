import * as executeService from '../services/executeService.js';
import { handleError } from '../utils/errorHandler.js';

export async function getRuntimes(req, res) {
  try {
    const data = await executeService.getRuntimes();
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Failed to fetch runtimes');
  }
}

export async function executeCode(req, res) {
  try {
    const { language, code, stdin = '', version = '*' } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ error: 'language and code are required' });
    }

    const result = await executeService.executeCode(language, code, stdin, version);
    res.json(result);
  } catch (err) {
    handleError(res, err, 'Code execution failed');
  }
}
