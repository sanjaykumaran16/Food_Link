const Message = require('../models/Message');

const buildConversationId = (userIdA, userIdB, listingId) => {
  const ids = [String(userIdA), String(userIdB)].sort();
  const base = `${ids[0]}_${ids[1]}`;
  return listingId ? `${base}_${listingId}` : base;
};

module.exports = { buildConversationId, Message };
