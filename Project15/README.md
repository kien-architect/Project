# Hybrid Disaster Recovery (DR) Strategies: Pilot Light vs. Warm Standby



## 1. Pilot Light (Hybrid)

### Pilot Light Flow
![Architecture](project15.1.png)

### 1.1 How It Works
* **Normal State:** * **On-Prem:** Runs the full application and Database (Production), serving 100% of user traffic.
    * **AWS:** Maintains only the "core" components. The database replica/standby is always running to synchronize data. Compute resources (EC2/EKS) are either turned off or provisioned at a near-zero scale.
* **During Failure (Failover):**
    1.  **Database:** Promote the AWS standby database to Primary.
    2.  **Compute:** Trigger automation scripts (IaC) to provision or scale out the Application Tier (from near-zero to full production capacity).
    3.  **Network:** Route 53 performs a DNS failover to redirect traffic to AWS.

### 1.2 Pros & Cons
* **Benefits:** Extremely low maintenance costs as there is no idle compute spend. Data is always ready, minimizing the risk of data loss (Low RPO).
* **Best For:** Systems with budget constraints that can tolerate a moderate Recovery Time Objective (RTO) while the application tier initializes.

---

## 2. Warm Standby (Hybrid)

### Warm Standby Flow
![Architecture](project15.2.png)

### 2.1 How It Works
* **Normal State:** * **On-Prem:** Runs Production and serves users.
    * **AWS:** A "scaled-down" version of the full environment is always online.
        * ALB/ELB is pre-provisioned and ready.
        * Auto Scaling Group (ASG) maintains a minimum number of instances (e.g., `min=1`) always online.
        * DB replica is continuously synchronized and running.
* **During Failure (Failover):**
    1.  **Network:** Route 53 fails over directly to the AWS ALB (traffic is handled immediately by the standby instances).
    2.  **Scale:** The ASG detects the load increase or follows a failover script to rapidly scale up to full capacity.
    3.  **Database:** Promote the database if necessary.

### 2.2 Pros & Cons
* **Benefits:** Significantly faster RTO than Pilot Light. Failover is more stable and predictable since the AWS infrastructure is subject to continuous health checks.
* **Best For:** Critical systems requiring minimal downtime and where the business accepts the higher cost of maintaining 24/7 idle compute.

---

## Comparison: Pilot Light vs. Warm Standby

| Criteria | Pilot Light | Warm Standby |
| :--- | :--- | :--- |
| **App Tier Status** | Off or Tiny | Always Running (Scaled-down) |
| **Maintenance Cost** | Low | Medium |
| **Recovery Time (RTO)** | Medium (Tens of minutes) | Fast (Minutes) |
| **Recovery Complexity** | High (Requires robust automation) | Low (System is already live) |

