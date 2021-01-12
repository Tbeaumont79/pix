class Tag {

  constructor({
    id,
    name,
  } = {}) {
    this.id = id;
    this.name = name;
  }
}
Tag.AGRICULTURE = 'AGRICULTURE';
Tag.POLE_EMPLOI = 'POLE EMPLOI';
Tag.CFA = 'CFA';
Tag.AEFE = 'AEFE';
Tag.MLF = 'MLF';
module.exports = Tag;
