import { PALETTE } from '../rendering/Materials';
import { RouterVisual } from './RouterVisual';

export class MergerVisual extends RouterVisual {
  constructor() {
    super('merger', PALETTE.teal);
  }
}
