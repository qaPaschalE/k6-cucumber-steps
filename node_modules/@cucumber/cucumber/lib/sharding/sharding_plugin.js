"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shardingPlugin = void 0;
exports.shardingPlugin = {
    type: 'plugin',
    coordinator: async ({ transform, options }) => {
        transform('pickles:filter', async (allPickles) => {
            if (!options.shard) {
                return allPickles;
            }
            const [shardIndexStr, shardTotalStr] = options.shard.split('/');
            const shardIndex = parseInt(shardIndexStr, 10) - 1;
            const shardTotal = parseInt(shardTotalStr, 10);
            return allPickles.filter((_, i) => i % shardTotal === shardIndex);
        });
    },
};
//# sourceMappingURL=sharding_plugin.js.map