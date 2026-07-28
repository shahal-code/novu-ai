import Memory from '../models/Memory.js';

/**
 * Load a user's memories and return them formatted for the system prompt.
 */
export async function loadMemoryContext(userId) {
  try {
    const mem = await Memory.findOne({ userId });
    if (!mem || !mem.facts.length) return '';

    const factLines = mem.facts
      .slice(-12) // last 12 facts, most recent
      .map((f) => `- ${f.text}`)
      .join('\n');

    return `\n\n--- USER MEMORY ---\nThings you remember about this user:\n${factLines}\n--- END MEMORY ---`;
  } catch {
    return '';
  }
}

/**
 * Extract new facts from the latest AI response and save them.
 * Simple keyword extraction — looks for self-referential statements.
 */
export async function extractAndSaveFacts(userId, messages) {
  try {
    const factTriggers = [
      /my name is ([a-zA-Z\s]+)/i,
      /i am ([a-zA-Z\s]+) years old/i,
      /i work as ([a-zA-Z\s]+)/i,
      /i am from ([a-zA-Z\s]+)/i,
      /i live in ([a-zA-Z\s]+)/i,
      /i like ([a-zA-Z\s,]+)/i,
      /i love ([a-zA-Z\s,]+)/i,
      /i prefer ([a-zA-Z\s,]+)/i,
      /i am a ([a-zA-Z\s]+)/i,
      /call me ([a-zA-Z\s]+)/i,
    ];

    const userMessages = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .slice(-5); // only last 5 user messages

    const newFacts = [];

    for (const msg of userMessages) {
      for (const trigger of factTriggers) {
        const match = msg.match(trigger);
        if (match) {
          const fact = `${match[0].charAt(0).toUpperCase()}${match[0].slice(1)}`;
          newFacts.push({ text: fact });
        }
      }
    }

    if (!newFacts.length) return;

    await Memory.findOneAndUpdate(
      { userId },
      {
        $push: { facts: { $each: newFacts, $slice: -50 } }, // keep last 50 facts
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Memory save error:', err.message);
  }
}

/**
 * Get all memories for a user.
 */
export async function getUserMemory(userId) {
  try {
    return await Memory.findOne({ userId });
  } catch {
    return null;
  }
}

/**
 * Delete a specific fact by index.
 */
export async function deleteMemoryFact(userId, factId) {
  try {
    await Memory.findOneAndUpdate(
      { userId },
      { $pull: { facts: { _id: factId } } }
    );
  } catch (err) {
    console.error('Memory delete error:', err.message);
  }
}

/**
 * Clear all memory for a user.
 */
export async function clearAllMemory(userId) {
  try {
    await Memory.findOneAndUpdate({ userId }, { $set: { facts: [] } });
  } catch (err) {
    console.error('Memory clear error:', err.message);
  }
}
