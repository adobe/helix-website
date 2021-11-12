# Helix Sidekick Configuration

To customize the [Helix Sidekick](./index.md) to your project, add configuration to your project's GitHub repository:
1. Add a `/tools/sidekick/config.js` file
2. Call `window.hlx.initSidekick()` to initialize the Sidekick with your custom configuration:
   ```js
   window.hlx.initSidekick({
     project: 'My Project',
     host: 'www.mydomain.prod',
     plugins: [
       { /* plugin config */ },
     ],
   });
   ```
3. For available configuration options, see the [Helix Sidekick API documentation](./API.md#sidekickConfig).
4. You're all set!
