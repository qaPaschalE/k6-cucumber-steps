"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPlugin = void 0;
const promises_1 = require("node:stream/promises");
const node_util_1 = require("node:util");
const promises_2 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = require("node:os");
const node_fs_1 = require("node:fs");
const node_zlib_1 = require("node:zlib");
const supports_color_1 = require("supports-color");
const has_ansi_1 = __importDefault(require("has-ansi"));
const DEFAULT_CUCUMBER_PUBLISH_URL = 'https://messages.cucumber.io/api/reports';
exports.publishPlugin = {
    type: 'plugin',
    coordinator: async ({ on, logger, options, environment }) => {
        if (!options) {
            return undefined;
        }
        const { url = DEFAULT_CUCUMBER_PUBLISH_URL, token } = options;
        const headers = {};
        if (token !== undefined) {
            headers.Authorization = `Bearer ${token}`;
        }
        const touchResponse = await fetch(url, { headers });
        const banner = await touchResponse.text();
        if (!touchResponse.ok) {
            return () => {
                if (touchResponse.status < 500) {
                    environment.stderr.write(sanitisePublishOutput(banner, environment.stderr) + '\n');
                }
                else {
                    logger.error(`Failed to publish report to ${new URL(url).origin} with status ${touchResponse.status}`);
                    logger.debug(touchResponse);
                }
            };
        }
        const uploadUrl = touchResponse.headers.get('Location');
        const tempDir = await (0, promises_2.mkdtemp)(node_path_1.default.join((0, node_os_1.tmpdir)(), `cucumber-js-publish-`));
        const tempFilePath = node_path_1.default.join(tempDir, 'envelopes.jsonl.gz');
        const writeStream = (0, node_zlib_1.createGzip)();
        const finishedWriting = (0, promises_1.pipeline)(writeStream, (0, node_fs_1.createWriteStream)(tempFilePath));
        on('message', (value) => writeStream.write(JSON.stringify(value) + '\n'));
        return () => {
            return new Promise((resolve) => {
                writeStream.end(async () => {
                    await finishedWriting;
                    const stats = await (0, promises_2.stat)(tempFilePath);
                    const contentLength = stats.size.toString();
                    logger.debug('Uploading envelopes to Cucumber Reports with content length:', contentLength);
                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/jsonl',
                            'Content-Encoding': 'gzip',
                            'Content-Length': contentLength,
                        },
                        body: (0, node_fs_1.createReadStream)(tempFilePath),
                        duplex: 'half',
                    });
                    if (uploadResponse.ok) {
                        environment.stderr.write(sanitisePublishOutput(banner, environment.stderr) + '\n');
                    }
                    else {
                        logger.error(`Failed to upload report to ${new URL(uploadUrl).origin} with status ${uploadResponse.status}`);
                        logger.debug(await uploadResponse.text());
                    }
                    resolve();
                });
            });
        };
    },
};
/*
This is because the Cucumber Reports service returns a pre-formatted console message
including ANSI escapes, so if our stderr stream doesn't support those we need to
strip them back out. Ideally we should get structured data from the service and
compose the console message on this end.
 */
function sanitisePublishOutput(raw, stderr) {
    if (!(0, supports_color_1.supportsColor)(stderr) && (0, has_ansi_1.default)(raw)) {
        return (0, node_util_1.stripVTControlCharacters)(raw);
    }
    return raw;
}
//# sourceMappingURL=publish_plugin.js.map