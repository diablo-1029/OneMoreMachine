import { PALETTE } from '../rendering/Materials';
import { RouterVisual } from './RouterVisual';

export class SplitterVisual extends RouterVisual {
  constructor() {
    super('splitter', PALETTE.yellow);
  }
}
