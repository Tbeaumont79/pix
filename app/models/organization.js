import DS from 'ember-data';

const { attr, hasMany } = DS;

export default DS.Model.extend({

  // Props
  name: attr(),
  type: attr(),
  code: attr(),
  logoUrl: attr(),

  // Relationships
  members: hasMany('users')

});
