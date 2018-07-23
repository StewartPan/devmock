module.exports = {
  server_port: 9080,
  ws_port: 9090,
  server_url: 'http://localhost:8080',
  distinguisher: ['taskId'],
  target_url: '/MstrMainBranch/servlet/taskProc',
  routes: [
    //"POST\\MstrMainBranch\\servlet\\taskProc\\keepSessionAlive.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\getLocaleInfo.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\getBundleDescriptors.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\qBuilder.GetQuota.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\arch.search.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\getDIProjectSettings.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\getMapShapes.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\arch.getCustomConnector.json",
    //"POST\\MstrMainBranch\\servlet\\taskProc\\arch.getDBObjects.json",
  ]
}
