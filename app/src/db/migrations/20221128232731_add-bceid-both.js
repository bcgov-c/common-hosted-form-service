const CREATED_BY = 'elmsd-01';

exports.up = function(knex) {
  return Promise.resolve()
    .then(() => {
      return knex('identity_provider').insert([
        {
          createdBy: CREATED_BY,
          code: 'bceid',
          display: 'Basic or Business BCeID',
          active: true,
          idp: 'bceid'
        }
      ]);
    });
};
  
exports.down = function(knex) {
  return Promise.resolve()
    .then(() => {
      return knex('identity_provider').where('createdBy', CREATED_BY).del();
    });
};
