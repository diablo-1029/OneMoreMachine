import './styles/global.css';
import './styles/hud.css';
import './styles/panels.css';
import { App } from './app/App';

const viewport = document.getElementById('viewport');
const ui = document.getElementById('ui');
if (!viewport || !ui) throw new Error('Missing #viewport or #ui element');

const app = new App(viewport, ui);
app.start().catch((error: unknown) => app.fail(error));
