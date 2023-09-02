import Model from '../Model';

import type Mimo from './Mimo';
import type Modulation from './Modulation';

export default class LteComponent extends Model {
  readonly type = 'lte-components';

  band = Model.attribute<number>('band');
  dlClass = Model.attribute<string | null>('dlClass');
  ulClass = Model.attribute<string | null>('ulClass');
  componentIndex = Model.attribute<number>('componentIndex');

  dlMimos = Model.hasMany<Mimo>('dlMimos');
  ulMimos = Model.hasMany<Mimo>('ulMimos');

  dlModulation = Model.hasMany<Modulation>('dlModulation');
  ulModulation = Model.hasMany<Modulation>('ulModulation');
}
