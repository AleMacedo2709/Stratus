// Utility to suppress specific React warnings in development
const originalError = console.error;
const originalWarn = console.warn;

// Lista de mensagens a serem suprimidas
const suppressedMessages = [
  'defaultProps will be removed from memo components',
  'has either width or height modified, but not the other'
];

// Substitui console.error para suprimir avisos específicos
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
    return;
  }
  originalError.apply(console, args);
};

// Substitui console.warn para suprimir avisos específicos
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
    return;
  }
  originalWarn.apply(console, args);
};

export {}; 