import type { Language, LocalizedText } from '@db-dojo/core';
import { localize } from '@db-dojo/core';

const strings = {
  submit: { de: 'Einreichen', en: 'Submit' },
  reset: { de: 'Zurücksetzen', en: 'Reset' },
  undo: { de: 'Rückgängig', en: 'Undo' },
  clearCanvas: { de: 'Alles löschen', en: 'Clear canvas' },
  clearCanvasConfirm: {
    de: 'Wirklich das ganze Diagramm löschen?',
    en: 'Really delete the whole diagram?'
  },
  zoomIn: { de: 'Vergrößern', en: 'Zoom in' },
  zoomOut: { de: 'Verkleinern', en: 'Zoom out' },
  resetView: { de: 'Ansicht zurücksetzen', en: 'Reset view' },
  passed: { de: 'Bestanden', en: 'Passed' },
  notThereYet: { de: 'Noch nicht ganz', en: 'Not there yet' },
  closeFeedback: { de: 'Rückmeldung schließen', en: 'Close feedback' },
  checking: { de: 'Wird geprüft…', en: 'Checking…' },

  paletteTitle: { de: 'Palette', en: 'Palette' },
  groupElements: { de: 'Elemente', en: 'Elements' },
  groupRelationships: { de: 'Beziehungen', en: 'Relationships' },
  paletteHelp: {
    de: 'Element anklicken oder auf die Fläche ziehen.',
    en: 'Click an element or drag it onto the canvas.'
  },

  toolClass: { de: 'Klasse', en: 'Class' },
  toolTable: { de: 'Tabelle', en: 'Table' },
  toolAssociationClass: { de: 'Assoziationsklasse', en: 'Association class' },
  toolAssociation: { de: 'Assoziation', en: 'Association' },
  toolAggregation: { de: 'Aggregation', en: 'Aggregation' },
  toolComposition: { de: 'Komposition', en: 'Composition' },
  toolGeneralization: { de: 'Generalisierung', en: 'Generalization' },
  toolForeignKey: { de: 'Fremdschlüssel', en: 'Foreign key' },
  toolFunctionalDependency: { de: 'Funktionale Abhängigkeit', en: 'Functional dependency' },

  toolClassHint: {
    de: 'Eine Klasse mit Attributen.',
    en: 'A class with attributes.'
  },
  toolTableHint: {
    de: 'Eine Relation mit Spalten und Schlüsseln.',
    en: 'A relation with columns and keys.'
  },
  toolAssociationClassHint: {
    de: 'Nur auf einer bestehenden Beziehung platzierbar.',
    en: 'Can only be placed on an existing relationship.'
  },
  toolAssociationHint: {
    de: 'Verbindet zwei Klassen, Multiplizitäten an den Enden.',
    en: 'Connects two classes, multiplicities at the ends.'
  },
  toolAggregationHint: {
    de: 'Vom Ganzen zum Teil ziehen — die Raute sitzt beim Ganzen.',
    en: 'Drag from the whole to the part — the diamond sits at the whole.'
  },
  toolCompositionHint: {
    de: 'Vom Ganzen zum Teil ziehen — das Teil existiert nicht ohne das Ganze.',
    en: 'Drag from the whole to the part — the part cannot exist without the whole.'
  },
  toolGeneralizationHint: {
    de: 'Von der Unterklasse zur Oberklasse ziehen.',
    en: 'Drag from the subclass to the superclass.'
  },
  toolForeignKeyHint: {
    de: 'Von der Fremdschlüsselspalte zur referenzierten Spalte ziehen.',
    en: 'Drag from the foreign key column to the referenced column.'
  },
  toolFunctionalDependencyHint: {
    de: 'Bestimmende Attribute wählen, dann das abhängige Attribut.',
    en: 'Pick the determinant attributes, then the dependent attribute.'
  },

  stepPlaceElement: {
    de: 'Klicke auf eine freie Stelle der Fläche.',
    en: 'Click an empty spot on the canvas.'
  },
  stepPlaceAssociationClass: {
    de: 'Ziehe die Assoziationsklasse auf eine Beziehung.',
    en: 'Drop the association class onto a relationship.'
  },
  stepPickSource: { de: 'Startelement wählen.', en: 'Pick the starting element.' },
  stepPickTarget: { de: 'Zielelement wählen.', en: 'Pick the target element.' },
  stepPickSourceAttribute: {
    de: 'Startattribut wählen.',
    en: 'Pick the starting attribute.'
  },
  stepPickTargetAttribute: { de: 'Zielattribut wählen.', en: 'Pick the target attribute.' },
  stepPickDeterminants: {
    de: 'Bestimmende Attribute anklicken, dann mit „Weiter" bestätigen.',
    en: 'Click the determinant attributes, then confirm with "Next".'
  },
  stepPickDependent: {
    de: 'Abhängiges Attribut anklicken.',
    en: 'Click the dependent attribute.'
  },
  confirmDeterminants: { de: 'Weiter', en: 'Next' },
  cancelStep: { de: 'Abbrechen (Esc)', en: 'Cancel (Esc)' },

  namePlaceholder: { de: 'Name', en: 'Name' },
  attributePlaceholder: { de: 'Attribut', en: 'Attribute' },
  addAttribute: { de: 'Attribut hinzufügen', en: 'Add attribute' },
  removeAttribute: { de: 'Attribut entfernen', en: 'Remove attribute' },
  togglePrimaryKey: { de: 'Primärschlüssel umschalten', en: 'Toggle primary key' },
  toggleForeignKey: { de: 'Fremdschlüssel umschalten', en: 'Toggle foreign key' },
  deleteSelection: { de: 'Auswahl löschen (Entf)', en: 'Delete selection (Del)' },
  moveElement: { de: 'Element verschieben', en: 'Move element' },
  multiplicityPlaceholder: { de: '1', en: '1' },
  editMultiplicity: { de: 'Multiplizität bearbeiten', en: 'Edit multiplicity' },
  edgeLabelPlaceholder: { de: 'Bezeichnung', en: 'Label' },

  newClass: { de: 'Klasse', en: 'Class' },
  newTable: { de: 'Tabelle', en: 'Table' },
  newAssociationClass: { de: 'Assoziationsklasse', en: 'AssociationClass' },
  newAttribute: { de: 'attribut', en: 'attribute' },

  emptyCanvas: {
    de: 'Ziehe ein Element aus der Palette auf die Fläche.',
    en: 'Drag an element from the palette onto the canvas.'
  },
  legendTitle: { de: 'Legende', en: 'Legend' },
  legendPrimaryKey: { de: 'Primärschlüssel', en: 'primary key' },
  legendForeignKey: { de: 'Fremdschlüssel', en: 'foreign key' },
  legendDelete: {
    de: 'Element anklicken und Entf drücken zum Löschen.',
    en: 'Select an element and press Del to remove it.'
  },
  legendPan: {
    de: 'Leere Fläche ziehen zum Verschieben, Mausrad zum Zoomen.',
    en: 'Drag empty space to pan, use the wheel to zoom.'
  },
  hideTask: { de: 'Aufgabe ausblenden', en: 'Hide task' },
  showTask: { de: 'Aufgabe einblenden', en: 'Show task' },
  resetConfirm: {
    de: 'Diagramm auf den Ausgangszustand zurücksetzen?',
    en: 'Reset the diagram to its starting state?'
  }
} satisfies Record<string, LocalizedText>;

export type DiagramStringKey = keyof typeof strings;

export function d(key: DiagramStringKey, language: Language): string {
  return localize(strings[key], language);
}

const toolLabelKeys = {
  class: 'toolClass',
  table: 'toolTable',
  'association-class': 'toolAssociationClass',
  association: 'toolAssociation',
  aggregation: 'toolAggregation',
  composition: 'toolComposition',
  generalization: 'toolGeneralization',
  'foreign-key': 'toolForeignKey',
  'functional-dependency': 'toolFunctionalDependency'
} satisfies Record<string, DiagramStringKey>;

const toolHintKeys = {
  class: 'toolClassHint',
  table: 'toolTableHint',
  'association-class': 'toolAssociationClassHint',
  association: 'toolAssociationHint',
  aggregation: 'toolAggregationHint',
  composition: 'toolCompositionHint',
  generalization: 'toolGeneralizationHint',
  'foreign-key': 'toolForeignKeyHint',
  'functional-dependency': 'toolFunctionalDependencyHint'
} satisfies Record<string, DiagramStringKey>;

export function toolLabel(toolId: keyof typeof toolLabelKeys, language: Language): string {
  return d(toolLabelKeys[toolId], language);
}

export function toolHint(toolId: keyof typeof toolHintKeys, language: Language): string {
  return d(toolHintKeys[toolId], language);
}
