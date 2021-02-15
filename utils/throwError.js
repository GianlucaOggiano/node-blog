module.exports = (error) => {
  const err = new Error(error);
  err.status = 500;
  return err;
};
