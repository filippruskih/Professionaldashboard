// Thrown by an agent task to signal "nothing to do yet" (e.g. no data),
// which is distinct from success (real output was produced) and failure (an
// unexpected error occurred). Downstream agents that read a prior agent's
// latest *succeeded* run rely on this distinction — a skipped run must not
// look like it produced usable output.
export class AgentSkip extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentSkip";
  }
}
