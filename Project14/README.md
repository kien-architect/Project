# API Gateway Canary Release (Regional)

## 1. Overview

This README describes a safe rollout strategy for a new version of public REST APIs using Amazon API Gateway (Regional) with:

- **Custom Domain Name** (e.g., `api.example.com`)
- **Amazon Route 53 Alias record** pointing to the API Gateway custom domain target
- **Canary release deployment** at the API Gateway Stage level to achieve:
  - Minimal customer impact
  - Minimal data loss
  - Fast rollback

The core idea is to keep the same domain for customers and split production traffic between:
- **Stable deployment** (old version)
- **Canary deployment** (new version)

---

## 2. Architecture

### 2.1 Components

- **Client Applications**
  - Web / Mobile / Partner systems calling public REST endpoints

- **Amazon Route 53**
  - Alias record (`A/AAAA`) for `api.example.com`

- **API Gateway (Regional)**
  - Hosts the REST API
  - Stage: `prod`
  - Canary settings enabled to shift % traffic to new deployment

- **Backend Integration**
  - Lambda / ECS / ALB / HTTP endpoint / other AWS services

- **Observability**
  - CloudWatch Logs and Metrics for:
    - 4XX, 5XX errors
    - Latency
    - Integration errors
    - Throttles

---

## 3. Traffic Flow

# AWS API Gateway Canary Release Strategy

![Architecture](project14.png)
This document outlines the architecture, benefits, and step-by-step operational procedures for implementing a Canary Release strategy using Amazon API Gateway.

---

## 4. Why Canary Release Meets the Requirements

### 4.1 Minimal Customer Impact
* **Controlled Exposure:** Only a small percentage of users (e.g., 5%) interact with the new version initially.
* **Stability:** The vast majority of users remain on the stable API during validation.
* **No DNS Latency:** Since the domain remains the same, clients continue using the existing endpoint without DNS changes.

### 4.2 Minimal Data Loss
* **Non-destructive:** Does not overwrite the existing stable deployment during the testing phase.
* **Immediate Recovery:** Rollback is instantaneous by setting the canary traffic to 0%.
* **Limited Blast Radius:** If a bug exists, only a tiny subset of requests are affected.

### 4.3 Fast Rollback
Canary rollback is superior because it avoids:
1. Route 53 record changes.
2. Waiting for DNS propagation (TTL).
3. Redeploying the entire API stack.
> **Note:** A single configuration change routes 100% of traffic back to the stable environment.

---



---

## 5. Deployment Strategy (Step-by-Step)

### Step 0 — Preconditions
* API Gateway is Regional.
* Custom domain exists and is mapped to the API.
* Route 53 Alias points to the API Gateway custom domain target.
* Logging and CloudWatch metrics are enabled.

### Step 1 — Deploy Stable (Current Production)
Confirm your current environment:
* **Stage:** `prod`
* **Deployment:** `stable` (current API behavior)

### Step 2 — Create New Deployment
Prepare the new API version:
* Update API Gateway resources/methods/integrations.
* (Optional) Import updated OpenAPI definition.
* **Action:** Create a new **Deployment** without switching customers yet.

### Step 3 — Enable Canary on the `prod` Stage
In the `prod` stage settings:
1. **Enable Canary**.
2. **Set Traffic Split:** e.g., Canary: 5% / Stable: 95%.
3. **Stage Variables:** (Optional) Use variables to direct traffic (e.g., `canary` uses `lambdaAlias = v2`).

### Step 4 — Monitor & Validate
Keep the canary small long enough to monitor:
* **5XX Errors** (Gateway and Integration).
* **Latency** (p95/p99 spikes).
* **Business KPIs** and Throttling.

### Step 5 — Gradually Increase Traffic
Ramp up based on confidence:
`5% → 10% → 25% → 50% → 100%`

### Step 6 — Promote Canary to Stable
Once 100% traffic is reached and stable:
1. Promote the canary deployment to become the new stable deployment.
2. Disable the canary setting (cleanup).

---

## 6. Rollback Plan (Operational Runbook)

### Immediate Rollback
If errors are detected:
* **Action:** Set Canary traffic percentage to 0%.
* **Result:** 100% of traffic returns to the stable deployment instantly.

### Post-Rollback Actions
1. Investigate CloudWatch logs and X-Ray traces.
2. Fix the backend or API configuration issue.
3. Re-deploy the canary with the corrected version and restart the ramp-up.

---

## 7. Anti-Patterns (What Not to Do)
* **Direct Overwrite:** Importing and deploying directly to production impacts 100% of users instantly.
* **Route 53 Weighted Records:** Creating two separate APIs and switching DNS causes propagation delays and makes it harder to manage percentage-based shifts for specific API stages.

---

## 8. Exam Memory Shortcut (SAA/DVA)
| If the question contains... | Answer... |
| :--- | :--- |
| API Gateway, Public REST APIs, New version rollout | API Gateway Canary Release |
| Minimal impact, safe rollout, quick rollback | Stage-based canary deployment |

---

## 9. Best Practices
* **Alarms:** Always set CloudWatch alarms on `5XXError` and `Latency`.
* **Tracing:** Use AWS X-Ray for deeper visibility into integration latencies.
* **Backend Versioning:** Use Lambda Aliases or separate ECS Target Groups to ensure your backend matches the API version.

---

## 10. Appendix: Minimal Runbook Summary
1. Deploy new version.
2. Set Canary to 5%.
3. Monitor metrics.
4. Increase to 100%.
5. Promote to Stable.
6. Rollback: Set Canary to 0%.

