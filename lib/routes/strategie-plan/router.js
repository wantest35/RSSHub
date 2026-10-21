export default (router) => {
    // Lorsque quelqu'un tape /strategie-plan/publications, RSSHub lancera votre script
    router.get('/publications', './publications');
};
