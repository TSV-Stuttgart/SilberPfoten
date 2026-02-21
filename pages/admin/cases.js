import React, { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import slugify from "slugify";
import useSession from "../../lib/auth/useSession";
import AdminWrapper from "../../components/AdminWrapper";
import Error from "../../components/Error";
import Loading from "../../components/Loading";
import Link from "next/link";

export default function Home() {
  const { mutate } = useSWRConfig();

  const [status, setStatus] = useState("OPEN");
  const [formZipcode, setFormZipcode] = useState("");

  const { data: messages, error: messagesError } = useSWR(
    `/api/admin/cases`,
    (url) => fetch(url).then((r) => r.json()),
  );
  const { session } = useSession();

  useEffect(() => {
    import("bootstrap/js/dist/dropdown");
  }, []);

  if (!session) return <Loading />;

  const deleteMessage = async (messageId) => {
    const confirmed = confirm("Wirklich unwiderruflich löschen?");

    if (confirmed) {
      await fetch(`/api/admin/message?messageId=${messageId}`, {
        method: "DELETE",
      });

      mutate(`/api/admin/cases`);
    }
  };

  const changeMessageStatus = async (messageId, newStatus) => {
    await fetch(`/api/admin/message?messageId=${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field: "status",
        status: newStatus,
      }),
    });

    mutate(`/api/admin/cases`);
  };

  if (messagesError) return <Error />;
  if (!messages && !messagesError) return <Loading />;

  return (
    <>
      <AdminWrapper>
        <div className="container mt-3 mb-3">
          <div className="row">
            <div className="col-7">
              <div className="fw-bold h3">Suchaufträge</div>
            </div>
            <div className="col-5 text-end">
              <div className="btn-group" role="group">
                <Link href="/admin/case/add" className="btn btn-secondary">
                  Neuer Suchauftrag
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-1 mb-3">
          <div className="row mt-0 mb-1">
            <div className="col-4 fw-bold">
              <span className="align-middle">Filtern nach:</span>
            </div>
          </div>
          <div className="row mt-0">
            <div className="col-4 fw-bold">
              <input
                type="text"
                name="formSubject"
                className="form-control"
                placeholder="PLZ"
                value={formZipcode}
                onChange={(e) => setFormZipcode(e.target.value)}
                required
              />
            </div>
            <div className="col-8 fw-bold text-end">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-light${status === "OPEN" ? " active" : ""}`}
                  onClick={() => setStatus("OPEN")}
                >
                  Offen (
                  {messages.filter((m) => m.status === "OPEN")?.length || 0})
                </button>
                <button
                  className={`btn btn-light${status === "CLOSED" ? " active" : ""}`}
                  onClick={() => setStatus("CLOSED")}
                >
                  Geschlossen (
                  {messages.filter((m) => m.status === "CLOSED")?.length || 0})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mb-3">
          <div className="row mt-2">
            <div className="col-12">
              <div className="p-3 bg-light rounded">
                <div className="row">
                  <div className="col-1 fw-bold border-end">PLZ</div>
                  <div className="col-5 fw-bold border-end">Betreff</div>
                  <div className="col-3 fw-bold border-end">Status</div>
                  <div className="col-2 fw-bold">Erstellt am</div>
                </div>
              </div>
            </div>
          </div>
          {messages
            .filter(
              (m) =>
                m.message_type === "case" &&
                m.status === status &&
                m.zipcode.startsWith(formZipcode),
            )
            .map((message) => (
              <React.Fragment key={message.message_id}>
                <div className="row">
                  <div className="col-12">
                    <div className="px-3 py-1">
                      <div className="row align-items-center">
                        <div className="col-1 border-end">
                          {message.zipcode}
                        </div>
                        <div className="col-5 border-end">
                          <Link
                            href={`/admin/case/${message.message_id}/${slugify(message.subject, { lower: true })}`}
                            className="text-decoration-none text-dark"
                          >
                            {message.subject}
                          </Link>
                        </div>
                        <div className="col-3 border-end">
                          {!message.accepted_case_users ? (
                            <span className="fw-normal text-success">
                              Bedarf für Hilfe vorhanden
                            </span>
                          ) : null}
                          {message.accepted_case_users?.length > 0 ? (
                            <>
                              <span className="fw-normal text-success">
                                {message.accepted_case_users?.length} Bewerber
                                <br />
                              </span>
                              (
                              <span className="fw-normal">
                                {
                                  message.accepted_case_users.filter(
                                    (acu) => acu.accepted_at,
                                  )?.length
                                }{" "}
                                akzeptiert,{" "}
                              </span>
                              <span className="fw-normal">
                                {
                                  message.accepted_case_users.filter(
                                    (acu) =>
                                      !acu.accepted_at && !acu.rejected_at,
                                  )?.length
                                }{" "}
                                wartend
                              </span>
                              )
                            </>
                          ) : null}
                        </div>
                        <div className="col-2">
                          {new Date(message.created_at).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          Uhr
                        </div>
                        <div className="col-1 text-end">
                          <div className="dropdown">
                            <i
                              className="bi bi-three-dots-vertical text-secondary cursor-pointer"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            ></i>
                            <ul className="dropdown-menu">
                              <li>
                                {status === "OPEN" ? (
                                  <div
                                    className="dropdown-item cursor-pointer"
                                    title="Schließen"
                                    onClick={() =>
                                      changeMessageStatus(
                                        message.message_id,
                                        "CLOSED",
                                      )
                                    }
                                  >
                                    Schließen
                                  </div>
                                ) : null}
                                {status === "CLOSED" ? (
                                  <div
                                    className="dropdown-item cursor-pointer"
                                    title="Öffnen"
                                    onClick={() =>
                                      changeMessageStatus(
                                        message.message_id,
                                        "OPEN",
                                      )
                                    }
                                  >
                                    Öffnen
                                  </div>
                                ) : null}
                              </li>
                              <li>
                                <div
                                  className="dropdown-item cursor-pointer"
                                  title="Löschen"
                                  onClick={() =>
                                    deleteMessage(message.message_id)
                                  }
                                >
                                  Löschen
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
        </div>
      </AdminWrapper>
    </>
  );
}
