import Model, { attr } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('boolean') outdated;
  @attr('string') organizationId;
}
