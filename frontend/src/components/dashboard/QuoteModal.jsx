// Project actions preserve guest storage and authenticated API ownership boundaries.
import React from "react";

import { Check } from "lucide-react";

import Dialog from "../../components/Dialog";
import "./QuoteModal.css";
export default function QuoteModal({ quoteFor, setQuoteFor, quote, notice, busy }) {
return (        <Dialog
          title={quoteFor.entry ? "Edit your quote" : "Add a quote"}
          id="quote-title"
          onClose={() => setQuoteFor(null)}
          className="quote-modal"
        >
          <p>Keep the details for {quoteFor.project.service} together.</p>
          <form onSubmit={quote}>
            <label>
              Provider
              <input
                data-autofocus
                name="provider"
                required
                maxLength={120}
                defaultValue={quoteFor.entry?.provider || ""}
              />
            </label>
            <label>
              Quote amount ($)
              <input
                name="amount"
                type="number"
                required
                min="0"
                max="100000000"
                step="0.01"
                defaultValue={quoteFor.entry?.amount ?? ""}
              />
            </label>
            <label>
              Notes
              <textarea
                name="notes"
                maxLength={2000}
                defaultValue={quoteFor.entry?.notes || ""}
              />
            </label>
            <small>
              These are quotes you collect, not a published market estimate.
            </small>
            <p role="alert">{notice}</p>
            <button className="button full" disabled={busy}>
              {busy ? "Saving…" : "Save quote"}
              <Check size={16} />
            </button>
          </form>
        </Dialog>);
}
