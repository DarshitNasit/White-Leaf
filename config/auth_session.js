module.exports = (req, delete_session) => {
  delete_session.forEach((element) => {
    if (req.session.element) delete req.session.element;
  });
};
