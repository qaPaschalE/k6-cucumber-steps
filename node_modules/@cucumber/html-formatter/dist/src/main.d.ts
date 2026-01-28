import './styles.scss';
import { Envelope } from '@cucumber/messages';
declare global {
    interface Window {
        CUCUMBER_MESSAGES: Envelope[];
    }
}
//# sourceMappingURL=main.d.ts.map