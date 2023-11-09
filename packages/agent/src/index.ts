(async () => {
    const environment = await import('./environment');
    await environment.loadEnvironmentVariables();

    await import('./database');
    await import('./agent');
})().catch((error) => {
    console.error('Failed to initialize the agent:', error);
});

