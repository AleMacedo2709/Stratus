# Strategic Planning Structure and Logic

## Strategic Planning Cycle
- **Duration**: 6 years
- **Components**:
  - Mission, Vision, and Values
  - Strategic Perspectives
  - Strategic Objectives
  - Indicators
  - Strategic Actions
  - Strategic Plan Goals (**6-year horizon**)
  - Risk and Cost Impact Analysis

## Status Flow
- All entities (Actions, Initiatives, Tasks, Plans) follow the status:
  - Aguardando aprovação
  - Não iniciado
  - Em andamento
  - Concluído
  - Suspenso
  - Descontinuada

## Initiative Types
- **Planejada**: Contributes to strategic goals and metrics
- **Contínua**: Operational activities, doesn't impact strategic metrics
- **Não Planejada**: Unplanned activities, doesn't impact strategic metrics

## Progress Tracking
### Tasks → Initiatives
Progress calculation includes:
- Task weight
- Risk level (Baixo, Médio, Alto)
- Cost impact (Baixo, Médio, Alto)
- Status changes logged in TaskProgressLog

### Initiatives → Strategic Actions
Progress calculation includes:
- Initiative weight
- Only "Planejada" type initiatives impact strategic metrics
- Risk and cost impact assessment
- Status changes logged in InitiativeProgressLog

### Strategic Actions → Strategic Goals
Progress calculation includes:
- Action weight
- Cumulative initiative progress
- Risk and cost impact analysis
- Status changes logged in ActionProgressLog

## Breakdown into Annual Action Plan (AAP)
Each strategic planning cycle is divided into **6 annual AAP cycles**:
- **Strategic Actions** are broken down into **Annual Initiatives**.
- **Annual Goals** detail the expected progress within the specific year.
- **Strategic Plan Goals** are achieved through the cumulative results of the Annual Goals.

### Categories of Initiatives in the AAP
1. **Planned in Strategic Planning**: Directly linked to strategic actions.
2. **Not Planned in Strategic Planning**: Initiatives outside the initial scope.
3. **Continuous Activity**: Recurring operational activities.

**Note**: Only initiatives planned in the strategic planning contribute to the progress calculation of both the AAP and the strategic plan.

---

## Key Relationships and Indicator Connection

### Indicators
- Indicators are central to monitoring both **Strategic Plan Goals** and **Annual Goals**.
- **Strategic Plan Indicators**: Track progress and results for the entire 6-year cycle.
- **Annual Indicators**: Measure performance of specific initiatives during the AAP cycle.

### Strategic Actions
- **Strategic Level**: Cover the entire 6-year planning cycle.
- **Progress and Results**:
  - **Strategic Action Progress** = Weighted sum of progress from linked initiatives.
  - **Strategic Action Results** = Sum of results from Annual Goals, measured by linked indicators.

### Annual Initiatives
- **Operational Breakdown**: Represent the annual execution of strategic actions.
- **Progress and Results**:
  - **Initiative Progress** = Weighted sum of progress from linked tasks.
  - **Initiative Results** = Measured by indicators and contribute to Annual Goals.

### Tasks
- **Execution Level**: Always linked to an initiative.
- Represent detailed actions required to achieve annual goals.
- **Progress**: Determined by percentage completion of each task.

---

## Hierarchical Structure

```mermaid
graph TD
  A[Strategic Planning] -->|6 years| B[Strategic Actions]
  B -->|Annual Breakdown| C[Annual Initiatives]
  C -->|Execution Level| D[Tasks]
  B --> E[Strategic Plan Goals]
  C --> F[Annual Goals]
  F --> G[Indicators]
  E --> G

# Calculation Logic

## Tasks → Initiatives

### Initiative Progress:
\[
\text{Initiative Progress} = \frac{\sum (\text{Task Progress} \times \text{Task Weight})}{\text{Total Task Weight}}
\]

### Initiative Results:
\[
\text{Initiative Results} = \text{Sum of Annual Goal Progress}
\]

---

## Initiatives → Strategic Actions

### Strategic Action Progress:
\[
\text{Strategic Action Progress} = \frac{\sum (\text{Initiative Progress} \times \text{Initiative Weight})}{\text{Total Initiative Weight}}
\]

### Strategic Action Results:
\[
\text{Strategic Action Results} = \text{Sum of Annual Goal Results}
\]

---

## Annual Goals → Strategic Plan Goals

### Strategic Plan Results:
\[
\text{Strategic Plan Results} = \sum \text{Annual Goal Results (6 years)}
\]

---

## Indicators
- All results (both Annual and Strategic Plan Goals) are measured by linked indicators.

### Indicator Types:
1. **Quantitative**: Numeric progress (e.g., % of processes digitized).
2. **Qualitative**: Categorical or descriptive progress (e.g., "Implemented/Not Implemented").

---

## Monitoring and Evaluation

1. **Task Progress**:
   - Tracked in real-time as tasks are executed.
2. **Initiative Progress**:
   - Weighted sum of task progress linked to the initiative.
3. **Strategic Action Progress**:
   - Weighted sum of progress from linked initiatives.
4. **Annual Goals**:
   - Monitored monthly or quarterly, depending on AAP schedules.
5. **Strategic Plan Goals**:
   - Evaluated annually and cumulatively across the 6-year cycle.

---

## Examples of Use

### Strategic Planning (2025-2030)
- **Strategic Action**: "Promote the digitization of judicial processes."
- **Strategic Plan Goal**: Digitize 100% of judicial processes by 2030.
- **Indicator**: % of processes digitized.

### Annual Action Plan (2025)
- **Initiative**: "Train staff in digital tools."
  - **Annual Goal**: Train 500 staff members by December 2025.
  - **Indicator**: Number of staff members trained.
  - **Tasks**:
    1. "Organize 10 workshops on process automation."
    2. "Implement 5 digital tools in pilot courts."

---

## Benefits of the Structure

1. **Clarity**: Clearly defines relationships between Strategic Actions, Annual Initiatives, and Indicators.
2. **Traceability**: Links Strategic Plan and Annual Goals to measurable indicators.
3. **Flexibility**: Allows inclusion of unplanned or continuous activities without affecting strategic progress.
4. **Data-Driven**: Progress and results are fully based on indicators, ensuring objective monitoring.
