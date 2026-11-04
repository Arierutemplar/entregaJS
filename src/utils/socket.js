let ioInstance = null;

export const setSocketServer = io => {
  ioInstance = io;
};

export const emitToAll = (event, data) => {
  if (!ioInstance) return false;
  ioInstance.emit(event, data);
  return true;
};
