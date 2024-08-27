export default {
    promises: {
        readFile: async () => {
            throw new Error('fs is not available in the browser');
        }
    }
};
