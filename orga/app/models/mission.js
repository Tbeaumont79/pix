import Model, { attr } from '@ember-data/model';

export default class Mission extends Model {
  @attr('string') name;
  @attr('string') competenceName;
}
