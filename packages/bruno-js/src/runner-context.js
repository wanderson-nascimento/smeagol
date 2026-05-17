const getRunnerContextFromRequest = (request = {}) => ({
  iterationVariables: request.iterationVariables || {},
  iterationIndex: request.iterationIndex ?? 0,
  totalIterations: request.totalIterations ?? 1
});

module.exports = { getRunnerContextFromRequest };
