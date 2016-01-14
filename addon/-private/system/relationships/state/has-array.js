import Relationship from "ember-data/-private/system/relationships/state/relationship";
import OrderedSet from "ember-data/-private/system/ordered-set";
import ManyArray from "ember-data/-private/system/many-array";

export default function ArrayRelationship(store, record, inverseKey, relationshipMeta) {
  this._super$constructor(store, record, inverseKey, relationshipMeta);
  this.belongsToType = relationshipMeta.type;
  this.canonicalState = [];
  // this.manyArray = ManyArray.create({
  //   canonicalState: this.canonicalState,
  //   store: this.store,
  //   relationship: this,
  //   type: this.store.modelFor(this.belongsToType),
  //   record: record
  // });
  this.isPolymorphic = relationshipMeta.options.polymorphic;
  // this.manyArray.isPolymorphic = this.isPolymorphic;
}

ArrayRelationship.prototype = Object.create(Relationship.prototype);
ArrayRelationship.prototype.constructor = ArrayRelationship;
ArrayRelationship.prototype._super$constructor = Relationship;

ArrayRelationship.prototype.computeChanges = function(records) {
  var members = this.canonicalMembers;
  var recordsToRemove = [];
  var length;
  var record;
  var i;

  records = setForArray(records);

  members.forEach(function(member) {
    if (records.has(member)) { return; }

    recordsToRemove.push(member);
  });

  this.removeCanonicalRecords(recordsToRemove);

  // Using records.toArray() since currently using
  // removeRecord can modify length, messing stuff up
  // forEach since it directly looks at "length" each
  // iteration
  records = records.toArray();
  length = records.length;
  for (i = 0; i < length; i++) {
    record = records[i];
    this.removeCanonicalRecord(record);
    this.addCanonicalRecord(record, i);
  }
};
ArrayRelationship.prototype.addCanonicalRecord = function(record, idx) {
  if (!this.canonicalMembers.has(record)) {
    this.canonicalMembers.add(record);
    // if (this.inverseKey) {
    //   record._relationships.get(this.inverseKey).addCanonicalRecord(this.record);
    // } else {
    //   if (!record._implicitRelationships[this.inverseKeyForImplicit]) {
    //     record._implicitRelationships[this.inverseKeyForImplicit] = new Relationship(this.store, record, this.key,  { options: {} });
    //   }
    //   record._implicitRelationships[this.inverseKeyForImplicit].addCanonicalRecord(this.record);
    // }
  }
  this.flushCanonicalLater();
  this.setHasData(true);
};
ArrayRelationship.prototype.removeCanonicalRecord = function(record, idx) {
  if (this.canonicalMembers.has(record)) {
    this.removeCanonicalRecordFromOwn(record);
    // if (this.inverseKey) {
    //   this.removeCanonicalRecordFromInverse(record);
    // } else {
    //   if (record._implicitRelationships[this.inverseKeyForImplicit]) {
    //     record._implicitRelationships[this.inverseKeyForImplicit].removeCanonicalRecord(this.record);
    //   }
    // }
  }
  this.flushCanonicalLater();
};

ArrayRelationship.prototype.getRecords = function() {
  return this.canonicalMembers.toArray();
  // //TODO(Igor) sync server here, once our syncing is not stupid
  // if (this.isAsync) {
  //   var promise;
  //   if (this.link) {
  //     if (this.hasLoaded) {
  //       promise = this.findRecords();
  //     } else {
  //       promise = this.findLink().then(() => this.findRecords());
  //     }
  //   } else {
  //     promise = this.findRecords();
  //   }
  //   return PromiseManyArray.create({
  //     content: this.manyArray,
  //     promise: promise
  //   });
  // } else {
  //   assert("You looked up the '" + this.key + "' relationship on a '" + this.record.type.modelName + "' with id " + this.record.id +  " but some of the associated records were not loaded. Either make sure they are all loaded together with the parent record, or specify that the relationship is async (`DS.hasMany({ async: true })`)", this.manyArray.isEvery('isEmpty', false));
  //
  //   //TODO(Igor) WTF DO I DO HERE?
  //   if (!this.manyArray.get('isDestroyed')) {
  //     this.manyArray.set('isLoaded', true);
  //   }
  //   return this.manyArray;
  // }
};

ArrayRelationship.prototype.flushCanonical = function() {
  // this.willSync = false;
  // //a hack for not removing new records
  // //TODO remove once we have proper diffing
  // var newRecords = [];
  // for (var i=0; i<this.members.list.length; i++) {
  //   if (this.members.list[i].isNew()) {
  //     newRecords.push(this.members.list[i]);
  //   }
  // }
  // //TODO(Igor) make this less abysmally slow
  // this.members = this.canonicalMembers.copy();
  // for (i=0; i<newRecords.length; i++) {
  //   this.members.add(newRecords[i]);
  // }
};

function setForArray(array) {
  var set = new OrderedSet();

  if (array) {
    for (var i=0, l=array.length; i<l; i++) {
      set.add(array[i]);
    }
  }

  return set;
}
