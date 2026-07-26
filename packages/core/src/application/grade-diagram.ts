import type {
  Diagram,
  DiagramAttribute,
  DiagramEdge,
  DiagramEdgeKind,
  DiagramEndpoint,
  DiagramNode,
  DiagramNodeKind
} from '../domain/diagram';
import type { DiagramSolution, SolutionEdge, SolutionNode } from '../domain/diagram-solution';
import type { DiagramSpec } from '../domain/grading';
import { type Language, type LocalizedText, localize } from '../domain/localized-text';
import type { Verdict } from '../domain/verdict';

const MAX_FEEDBACK_LINES = 10;

const MESSAGES = {
  allCorrect: {
    de: 'Das Diagramm entspricht der Musterlösung.',
    en: 'The diagram matches the expected solution.'
  },
  emptyDiagram: {
    de: 'Die Zeichenfläche ist noch leer.',
    en: 'The canvas is still empty.'
  },
  missingNode: {
    de: 'Es fehlt: {kind} „{name}".',
    en: 'Missing: {kind} "{name}".'
  },
  unexpectedNode: {
    de: '{kind} „{name}" gehört nicht in die Lösung.',
    en: '{kind} "{name}" does not belong in the solution.'
  },
  wrongNodeKind: {
    de: '„{name}" ist als {actual} gezeichnet, erwartet wird {expected}.',
    en: '"{name}" is drawn as {actual}, but should be {expected}.'
  },
  missingAttribute: {
    de: 'In „{node}" fehlt das Attribut „{attribute}".',
    en: '"{node}" is missing the attribute "{attribute}".'
  },
  unexpectedAttribute: {
    de: 'Das Attribut „{attribute}" gehört nicht in „{node}".',
    en: 'The attribute "{attribute}" does not belong in "{node}".'
  },
  missingPrimaryKey: {
    de: '„{attribute}" in „{node}" muss Primärschlüssel sein.',
    en: '"{attribute}" in "{node}" has to be a primary key.'
  },
  unexpectedPrimaryKey: {
    de: '„{attribute}" in „{node}" ist kein Primärschlüssel.',
    en: '"{attribute}" in "{node}" is not a primary key.'
  },
  missingForeignKey: {
    de: '„{attribute}" in „{node}" muss Fremdschlüssel sein.',
    en: '"{attribute}" in "{node}" has to be a foreign key.'
  },
  unexpectedForeignKey: {
    de: '„{attribute}" in „{node}" ist kein Fremdschlüssel.',
    en: '"{attribute}" in "{node}" is not a foreign key.'
  },
  missingEdge: {
    de: 'Zwischen „{from}" und „{to}" fehlt: {kind}.',
    en: 'Missing between "{from}" and "{to}": {kind}.'
  },
  wrongEdgeKind: {
    de: 'Die Verbindung „{from}" — „{to}" ist {actual}, erwartet wird {expected}.',
    en: 'The connection "{from}" — "{to}" is {actual}, but should be {expected}.'
  },
  wrongEdgeDirection: {
    de: 'Die Verbindung {kind} zwischen „{from}" und „{to}" zeigt in die falsche Richtung.',
    en: 'The {kind} between "{from}" and "{to}" points the wrong way.'
  },
  unexpectedEdge: {
    de: 'Die Verbindung „{from}" — „{to}" gehört nicht in die Lösung.',
    en: 'The connection "{from}" — "{to}" does not belong in the solution.'
  },
  wrongMultiplicity: {
    de: 'Die Multiplizität bei „{node}" ist „{actual}", erwartet wird „{expected}".',
    en: 'The multiplicity at "{node}" is "{actual}", but should be "{expected}".'
  },
  missingMultiplicity: {
    de: 'Bei „{node}" fehlt die Multiplizität „{expected}".',
    en: 'The multiplicity "{expected}" is missing at "{node}".'
  },
  missingAssociationClass: {
    de: 'An der Verbindung „{from}" — „{to}" fehlt die Assoziationsklasse „{name}".',
    en: 'The association class "{name}" is missing on the connection "{from}" — "{to}".'
  },
  wrongEdgeAttribute: {
    de: 'Die {kind} muss an „{node}.{expected}" ansetzen, nicht an „{node}.{actual}".',
    en: 'The {kind} has to start at "{node}.{expected}", not at "{node}.{actual}".'
  },
  wrongDeterminants: {
    de: 'Die bestimmenden Attribute der Abhängigkeit auf „{target}" stimmen nicht.',
    en: 'The determinant attributes of the dependency on "{target}" are wrong.'
  },
  moreProblems: {
    de: '… und {count} weitere Abweichungen.',
    en: '… and {count} more differences.'
  }
} satisfies Record<string, LocalizedText>;

const NODE_KIND_LABELS = {
  class: { de: 'Klasse', en: 'class' },
  'association-class': { de: 'Assoziationsklasse', en: 'association class' },
  table: { de: 'Tabelle', en: 'table' }
} satisfies Record<DiagramNodeKind, LocalizedText>;

const EDGE_KIND_LABELS = {
  association: { de: 'Assoziation', en: 'association' },
  aggregation: { de: 'Aggregation', en: 'aggregation' },
  composition: { de: 'Komposition', en: 'composition' },
  generalization: { de: 'Generalisierung', en: 'generalization' },
  'foreign-key': { de: 'Fremdschlüssel-Beziehung', en: 'foreign key relationship' },
  'functional-dependency': { de: 'funktionale Abhängigkeit', en: 'functional dependency' }
} satisfies Record<DiagramEdgeKind, LocalizedText>;

export function gradeDiagram(diagram: Diagram, spec: DiagramSpec, language: Language): Verdict {
  if (diagram.nodes.length === 0) {
    return { passed: false, feedback: [localize(MESSAGES.emptyDiagram, language)] };
  }

  let closest: string[] | null = null;
  for (const solution of spec.solutions) {
    const problems = checkSolution(diagram, solution, language);
    if (problems.length === 0) {
      return { passed: true, feedback: [localize(MESSAGES.allCorrect, language)] };
    }
    if (closest === null || problems.length < closest.length) {
      closest = problems;
    }
  }

  const problems = closest ?? [];
  const shown = problems.slice(0, MAX_FEEDBACK_LINES);
  if (problems.length > shown.length) {
    shown.push(
      fill(MESSAGES.moreProblems, language, { count: String(problems.length - shown.length) })
    );
  }
  return { passed: false, feedback: shown };
}

function checkSolution(diagram: Diagram, solution: DiagramSolution, language: Language): string[] {
  const problems: string[] = [];
  const matching = matchNodes(diagram, solution);

  for (const expected of matching.missing) {
    problems.push(
      fill(MESSAGES.missingNode, language, {
        kind: localize(NODE_KIND_LABELS[expected.kind], language),
        name: expected.name
      })
    );
  }

  for (const mismatch of matching.wrongKind) {
    problems.push(
      fill(MESSAGES.wrongNodeKind, language, {
        name: mismatch.actual.name,
        actual: localize(NODE_KIND_LABELS[mismatch.actual.kind], language),
        expected: localize(NODE_KIND_LABELS[mismatch.expected.kind], language)
      })
    );
  }

  for (const node of matching.unexpected) {
    problems.push(
      fill(MESSAGES.unexpectedNode, language, {
        kind: localize(NODE_KIND_LABELS[node.kind], language),
        name: node.name
      })
    );
  }

  for (const expected of solution.nodes) {
    const actual = matching.byKey.get(expected.key);
    if (actual) {
      problems.push(...checkAttributes(expected, actual, language));
    }
  }

  problems.push(...checkEdges(diagram, solution, matching, language));
  return problems;
}

interface NodeMatching {
  byKey: Map<string, DiagramNode>;
  missing: SolutionNode[];
  wrongKind: { expected: SolutionNode; actual: DiagramNode }[];
  unexpected: DiagramNode[];
}

function matchNodes(diagram: Diagram, solution: DiagramSolution): NodeMatching {
  const byKey = new Map<string, DiagramNode>();
  const missing: SolutionNode[] = [];
  const wrongKind: { expected: SolutionNode; actual: DiagramNode }[] = [];
  const taken = new Set<string>();

  for (const expected of solution.nodes) {
    const names = acceptedNames(expected.name, expected.aliases);
    const candidates = diagram.nodes.filter(
      (node) => !taken.has(node.id) && names.includes(normalizeName(node.name))
    );
    const sameKind = candidates.find((node) => node.kind === expected.kind);
    const fallback = candidates[0];

    if (sameKind) {
      taken.add(sameKind.id);
      byKey.set(expected.key, sameKind);
    } else if (fallback) {
      taken.add(fallback.id);
      byKey.set(expected.key, fallback);
      wrongKind.push({ expected, actual: fallback });
    } else {
      missing.push(expected);
    }
  }

  return {
    byKey,
    missing,
    wrongKind,
    unexpected: diagram.nodes.filter((node) => !taken.has(node.id))
  };
}

function checkAttributes(
  expected: SolutionNode,
  actual: DiagramNode,
  language: Language
): string[] {
  const expectedAttributes = expected.attributes;
  if (!expectedAttributes) {
    return [];
  }

  const problems: string[] = [];
  const checksPrimaryKey = expectedAttributes.some((attribute) => attribute.isPrimaryKey);
  const checksForeignKey = expectedAttributes.some((attribute) => attribute.isForeignKey);
  const taken = new Set<string>();

  for (const wanted of expectedAttributes) {
    const names = acceptedNames(wanted.name, wanted.aliases);
    const found = actual.attributes.find(
      (attribute) => !taken.has(attribute.id) && names.includes(normalizeName(attribute.name))
    );
    if (!found) {
      problems.push(
        fill(MESSAGES.missingAttribute, language, { node: actual.name, attribute: wanted.name })
      );
      continue;
    }
    taken.add(found.id);

    if (checksPrimaryKey && found.isPrimaryKey !== (wanted.isPrimaryKey === true)) {
      const message = wanted.isPrimaryKey
        ? MESSAGES.missingPrimaryKey
        : MESSAGES.unexpectedPrimaryKey;
      problems.push(fill(message, language, { node: actual.name, attribute: found.name }));
    }
    if (checksForeignKey && found.isForeignKey !== (wanted.isForeignKey === true)) {
      const message = wanted.isForeignKey
        ? MESSAGES.missingForeignKey
        : MESSAGES.unexpectedForeignKey;
      problems.push(fill(message, language, { node: actual.name, attribute: found.name }));
    }
  }

  for (const attribute of actual.attributes) {
    if (!taken.has(attribute.id)) {
      problems.push(
        fill(MESSAGES.unexpectedAttribute, language, {
          node: actual.name,
          attribute: attribute.name
        })
      );
    }
  }

  return problems;
}

function checkEdges(
  diagram: Diagram,
  solution: DiagramSolution,
  matching: NodeMatching,
  language: Language
): string[] {
  const problems: string[] = [];
  const taken = new Set<string>();

  for (const expected of solution.edges) {
    const fromNode = matching.byKey.get(expected.from);
    const toNode = matching.byKey.get(expected.to);
    if (!fromNode || !toNode) {
      continue;
    }

    const ends = {
      from: { node: fromNode, declared: solutionNodeOf(solution, expected.from) },
      to: { node: toNode, declared: solutionNodeOf(solution, expected.to) }
    };
    const candidates = connectingEdges(diagram, fromNode, toNode, taken);
    const sameKind = candidates.filter((candidate) => candidate.edge.kind === expected.kind);
    const match =
      sameKind.find((candidate) => endpointsMatch(candidate, expected, ends)) ?? sameKind[0];

    if (!match) {
      const wrongKindEdge = candidates[0];
      if (wrongKindEdge) {
        taken.add(wrongKindEdge.edge.id);
        problems.push(
          fill(MESSAGES.wrongEdgeKind, language, {
            from: fromNode.name,
            to: toNode.name,
            actual: localize(EDGE_KIND_LABELS[wrongKindEdge.edge.kind], language),
            expected: localize(EDGE_KIND_LABELS[expected.kind], language)
          })
        );
      } else {
        problems.push(
          fill(MESSAGES.missingEdge, language, {
            from: fromNode.name,
            to: toNode.name,
            kind: localize(EDGE_KIND_LABELS[expected.kind], language)
          })
        );
      }
      continue;
    }

    taken.add(match.edge.id);

    if (match.swapped && !isSymmetric(expected.kind)) {
      problems.push(
        fill(MESSAGES.wrongEdgeDirection, language, {
          from: fromNode.name,
          to: toNode.name,
          kind: localize(EDGE_KIND_LABELS[expected.kind], language)
        })
      );
      continue;
    }

    problems.push(
      ...checkMultiplicities(match, expected, fromNode, toNode, language),
      ...checkEdgeAttributes(match, expected, ends, language),
      ...checkAssociationClass(match.edge, expected, solution, matching, fromNode, toNode, language)
    );
  }

  for (const edge of diagram.edges) {
    if (taken.has(edge.id)) {
      continue;
    }
    problems.push(
      fill(MESSAGES.unexpectedEdge, language, {
        from: nodeNameOf(diagram, edge.from.nodeId),
        to: nodeNameOf(diagram, edge.to.nodeId)
      })
    );
  }

  return problems;
}

interface EdgeMatch {
  edge: DiagramEdge;
  swapped: boolean;
  fromEndpoint: DiagramEndpoint;
  toEndpoint: DiagramEndpoint;
  fromMultiplicity: string;
  toMultiplicity: string;
}

function connectingEdges(
  diagram: Diagram,
  fromNode: DiagramNode,
  toNode: DiagramNode,
  taken: Set<string>
): EdgeMatch[] {
  const matches: EdgeMatch[] = [];

  for (const edge of diagram.edges) {
    if (taken.has(edge.id)) {
      continue;
    }
    const orientation = orientationOf(edge, fromNode, toNode);
    if (orientation === null) {
      continue;
    }
    const swapped = orientation === 'swapped';
    matches.push({
      edge,
      swapped,
      fromEndpoint: swapped ? edge.to : edge.from,
      toEndpoint: swapped ? edge.from : edge.to,
      fromMultiplicity: swapped ? edge.toMultiplicity : edge.fromMultiplicity,
      toMultiplicity: swapped ? edge.fromMultiplicity : edge.toMultiplicity
    });
  }

  return matches.sort((first, second) => Number(first.swapped) - Number(second.swapped));
}

function checkMultiplicities(
  match: EdgeMatch,
  expected: SolutionEdge,
  fromNode: DiagramNode,
  toNode: DiagramNode,
  language: Language
): string[] {
  const problems: string[] = [];
  const ends = [
    { wanted: expected.fromMultiplicity, actual: match.fromMultiplicity, node: fromNode },
    { wanted: expected.toMultiplicity, actual: match.toMultiplicity, node: toNode }
  ];

  for (const end of ends) {
    if (end.wanted === undefined) {
      continue;
    }
    if (normalizeMultiplicity(end.actual) === normalizeMultiplicity(end.wanted)) {
      continue;
    }
    if (end.actual.trim() === '') {
      problems.push(
        fill(MESSAGES.missingMultiplicity, language, {
          node: end.node.name,
          expected: end.wanted
        })
      );
    } else {
      problems.push(
        fill(MESSAGES.wrongMultiplicity, language, {
          node: end.node.name,
          actual: end.actual,
          expected: end.wanted
        })
      );
    }
  }

  return problems;
}

interface EdgeEnd {
  node: DiagramNode;
  declared: SolutionNode | undefined;
}

interface EdgeEnds {
  from: EdgeEnd;
  to: EdgeEnd;
}

function checkEdgeAttributes(
  match: EdgeMatch,
  expected: SolutionEdge,
  ends: EdgeEnds,
  language: Language
): string[] {
  const problems: string[] = [];

  if (expected.kind === 'functional-dependency') {
    if (!determinantsMatch(match, expected, ends.from)) {
      problems.push(
        fill(MESSAGES.wrongDeterminants, language, {
          target: attributeNameOf(ends.to.node, match.toEndpoint.attributeId) || ends.to.node.name
        })
      );
    }
  } else if (expected.fromAttribute !== undefined) {
    problems.push(
      ...attributeProblem(
        expected,
        ends.from,
        match.fromEndpoint.attributeId,
        expected.fromAttribute,
        language
      )
    );
  }

  if (expected.toAttribute !== undefined) {
    problems.push(
      ...attributeProblem(
        expected,
        ends.to,
        match.toEndpoint.attributeId,
        expected.toAttribute,
        language
      )
    );
  }

  return problems;
}

function attributeProblem(
  expected: SolutionEdge,
  end: EdgeEnd,
  attributeId: string | undefined,
  wanted: string,
  language: Language
): string[] {
  const actual = attributeNameOf(end.node, attributeId);
  if (acceptedAttributeNames(end.declared, wanted).includes(normalizeName(actual))) {
    return [];
  }
  return [
    fill(MESSAGES.wrongEdgeAttribute, language, {
      kind: localize(EDGE_KIND_LABELS[expected.kind], language),
      node: end.node.name,
      expected: wanted,
      actual: actual === '' ? '?' : actual
    })
  ];
}

function endpointsMatch(match: EdgeMatch, expected: SolutionEdge, ends: EdgeEnds): boolean {
  if (expected.kind === 'functional-dependency') {
    if (!determinantsMatch(match, expected, ends.from)) {
      return false;
    }
  } else if (expected.fromAttribute !== undefined) {
    const actual = attributeNameOf(ends.from.node, match.fromEndpoint.attributeId);
    if (
      !acceptedAttributeNames(ends.from.declared, expected.fromAttribute).includes(
        normalizeName(actual)
      )
    ) {
      return false;
    }
  }

  if (expected.toAttribute !== undefined) {
    const actual = attributeNameOf(ends.to.node, match.toEndpoint.attributeId);
    if (
      !acceptedAttributeNames(ends.to.declared, expected.toAttribute).includes(
        normalizeName(actual)
      )
    ) {
      return false;
    }
  }

  return true;
}

function determinantsMatch(match: EdgeMatch, expected: SolutionEdge, from: EdgeEnd): boolean {
  const wanted = expectedDeterminants(expected);
  if (wanted.length === 0) {
    return true;
  }

  const remaining = determinantsOf(match, from.node);
  if (remaining.length !== wanted.length) {
    return false;
  }

  for (const name of wanted) {
    const accepted = acceptedAttributeNames(from.declared, name);
    const index = remaining.findIndex((candidate) => accepted.includes(candidate));
    if (index === -1) {
      return false;
    }
    remaining.splice(index, 1);
  }
  return true;
}

function determinantsOf(match: EdgeMatch, fromNode: DiagramNode): string[] {
  const names: string[] = [];
  for (const attributeId of [
    match.fromEndpoint.attributeId,
    ...match.edge.additionalDeterminants
  ]) {
    const name = normalizeName(attributeNameOf(fromNode, attributeId));
    if (name !== '') {
      names.push(name);
    }
  }
  return names;
}

function expectedDeterminants(expected: SolutionEdge): string[] {
  const names = expected.fromAttribute ? [expected.fromAttribute] : [];
  for (const determinant of expected.additionalDeterminants ?? []) {
    names.push(determinant);
  }
  return names;
}

function solutionNodeOf(solution: DiagramSolution, key: string): SolutionNode | undefined {
  return solution.nodes.find((node) => node.key === key);
}

function acceptedAttributeNames(
  declared: SolutionNode | undefined,
  attributeName: string
): string[] {
  const attribute = declared?.attributes?.find(
    (candidate) => normalizeName(candidate.name) === normalizeName(attributeName)
  );
  return acceptedNames(attributeName, attribute?.aliases);
}

function checkAssociationClass(
  edge: DiagramEdge,
  expected: SolutionEdge,
  solution: DiagramSolution,
  matching: NodeMatching,
  fromNode: DiagramNode,
  toNode: DiagramNode,
  language: Language
): string[] {
  const expectedKey = expected.associationClass;
  if (!expectedKey) {
    return [];
  }
  const attached = matching.byKey.get(expectedKey);
  if (attached && attached.attachedEdgeId === edge.id) {
    return [];
  }
  const declared = solution.nodes.find((node) => node.key === expectedKey);
  return [
    fill(MESSAGES.missingAssociationClass, language, {
      from: fromNode.name,
      to: toNode.name,
      name: declared?.name ?? expectedKey
    })
  ];
}

function orientationOf(
  edge: DiagramEdge,
  fromNode: DiagramNode,
  toNode: DiagramNode
): 'direct' | 'swapped' | null {
  if (edge.from.nodeId === fromNode.id && edge.to.nodeId === toNode.id) {
    return 'direct';
  }
  if (edge.from.nodeId === toNode.id && edge.to.nodeId === fromNode.id) {
    return 'swapped';
  }
  return null;
}

function isSymmetric(kind: DiagramEdgeKind): boolean {
  return kind === 'association';
}

function nodeNameOf(diagram: Diagram, nodeId: string): string {
  return diagram.nodes.find((node) => node.id === nodeId)?.name ?? '?';
}

function attributeNameOf(node: DiagramNode, attributeId: string | undefined): string {
  if (!attributeId) {
    return '';
  }
  const attribute: DiagramAttribute | undefined = node.attributes.find(
    (candidate) => candidate.id === attributeId
  );
  return attribute?.name ?? '';
}

function acceptedNames(name: string, aliases: string[] | undefined): string[] {
  return [name, ...(aliases ?? [])].map(normalizeName);
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]/g, '');
}

function normalizeMultiplicity(value: string): string {
  const compact = value.trim().toLowerCase().replace(/\s/g, '');
  if (compact === 'n' || compact === 'm' || compact === '0..*' || compact === '0..n') {
    return '*';
  }
  if (compact === '1..n' || compact === '1..m') {
    return '1..*';
  }
  if (compact === '1..1') {
    return '1';
  }
  return compact;
}

function fill(text: LocalizedText, language: Language, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (message, [name, replacement]) => message.replaceAll(`{${name}}`, replacement),
    localize(text, language)
  );
}
