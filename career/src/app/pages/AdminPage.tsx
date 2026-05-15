import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type {
  AdminConsultantSummary,
  ConsultantProfileStatus
} from "../../lib/types";
import PageScene from "../layout/PageScene";

type Filter = "pending" | "all";

function statusLabel(status: AdminConsultantSummary["profileStatus"]) {
  if (status === "approved" || status === "active") return "Одобрен";
  if (status === "rejected") return "Отказан";
  return "Чакащ одобрение";
}

function statusBadgeClass(status: AdminConsultantSummary["profileStatus"]) {
  if (status === "approved" || status === "active") {
    return "status-badge status-badge--success";
  }
  if (status === "rejected") return "status-badge status-badge--cancelled";
  return "plan-pill";
}

export default function AdminPage() {
  const { token, isAdmin, loading, user } = useAuth();
  const [items, setItems] = useState<AdminConsultantSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setError("");
    try {
      const next = await api.adminListConsultants(token);
      setItems(next);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Неуспешно зареждане.");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    void reload();
  }, [isAdmin, reload, token]);

  if (loading) {
    return (
      <PageScene tone="dashboard" pageKey="admin">
        <section className="section">
          <div className="container">
            <div className="panel">Проверяваме достъпа...</div>
          </div>
        </section>
      </PageScene>
    );
  }

  if (!user) {
    return <Navigate to="/auth?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <PageScene tone="dashboard" pageKey="admin">
        <section className="section">
          <div className="container">
            <div className="panel panel--error">
              Тази секция е достъпна само за администратори.
            </div>
          </div>
        </section>
      </PageScene>
    );
  }

  async function setStatus(
    consultantId: string,
    nextStatus: ConsultantProfileStatus
  ) {
    if (!token) return;
    setPendingActionId(consultantId);
    setError("");
    try {
      await api.adminSetConsultantStatus(token, consultantId, nextStatus);
      await reload();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Действието не успя.");
    } finally {
      setPendingActionId(null);
    }
  }

  const visible = items.filter((item) => {
    if (filter === "pending") return item.profileStatus === "pending";
    return true;
  });

  const counts = {
    pending: items.filter((item) => item.profileStatus === "pending").length,
    approved: items.filter(
      (item) => item.profileStatus === "approved" || item.profileStatus === "active"
    ).length,
    rejected: items.filter((item) => item.profileStatus === "rejected").length
  };

  return (
    <PageScene tone="dashboard" pageKey="admin">
      <section className="section">
        <div className="container">
          <div className="admin-header">
            <div>
              <p className="eyebrow">Админ</p>
              <h1>Одобряване на консултантски профили</h1>
              <p className="hero__lede">
                Преглеждаш заявките от консултанти и ментори преди публикуване.
              </p>
            </div>
            <div className="admin-stats">
              <span>
                <strong>{counts.pending}</strong>
                Чакащи
              </span>
              <span>
                <strong>{counts.approved}</strong>
                Одобрени
              </span>
              <span>
                <strong>{counts.rejected}</strong>
                Отказани
              </span>
            </div>
          </div>

          <div className="search-shortcuts">
            <div className="search-shortcuts__list">
              <button
                type="button"
                className={`shortcut-chip ${filter === "pending" ? "shortcut-chip--active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Чакащи ({counts.pending})
              </button>
              <button
                type="button"
                className={`shortcut-chip ${filter === "all" ? "shortcut-chip--active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Всички ({items.length})
              </button>
            </div>
          </div>

          <div role="alert" aria-live="assertive">
            {error ? <div className="panel panel--error">{error}</div> : null}
          </div>

          {listLoading ? (
            <div className="panel">Зареждаме заявките...</div>
          ) : visible.length === 0 ? (
            <div className="panel empty-state">
              {filter === "pending"
                ? "Няма чакащи заявки."
                : "Няма консултантски профили в системата."}
            </div>
          ) : (
            <div className="admin-list">
              {visible.map((item) => {
                const isApproved =
                  item.profileStatus === "approved" || item.profileStatus === "active";
                const isRejected = item.profileStatus === "rejected";
                const busy = pendingActionId === item.consultantId;
                return (
                  <article className="panel admin-card" key={item.consultantId}>
                    <div className="admin-card__head">
                      <div>
                        <span className="plan-pill">
                          {item.profileType === "mentor" ? "Ментор" : "Консултант"}
                        </span>
                        <h3>{item.name}</h3>
                        <p>{item.headline || "Без описание"}</p>
                      </div>
                      <span className={statusBadgeClass(item.profileStatus)}>
                        {statusLabel(item.profileStatus)}
                      </span>
                    </div>
                    <dl className="admin-card__meta">
                      <div>
                        <dt>Slug</dt>
                        <dd>{item.slug || "—"}</dd>
                      </div>
                      <div>
                        <dt>Град</dt>
                        <dd>{item.city || "—"}</dd>
                      </div>
                      <div>
                        <dt>Публичен</dt>
                        <dd>{item.isPublic ? "Да" : "Не"}</dd>
                      </div>
                    </dl>
                    <div className="admin-card__actions">
                      {!isApproved ? (
                        <button
                          className="primary-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(item.consultantId, "approved")}
                        >
                          {busy ? "Записваме..." : "Одобри"}
                        </button>
                      ) : null}
                      {!isRejected ? (
                        <button
                          className="ghost-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(item.consultantId, "rejected")}
                        >
                          {busy ? "Записваме..." : "Откажи"}
                        </button>
                      ) : null}
                      {(isApproved || isRejected) ? (
                        <button
                          className="ghost-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(item.consultantId, "pending")}
                        >
                          Върни в чакащи
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageScene>
  );
}
