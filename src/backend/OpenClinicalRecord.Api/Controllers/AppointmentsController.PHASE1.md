# Phase 1 change for AppointmentsController

Replace UpdateStatus authorize attribute with:

```csharp
[HttpPatch("{id:guid}/status")]
[Authorize(Roles = "Receptionist,Doctor,Nurse")]
```

Admin must NOT be on this list.

Full local commit: `45c7a95` on the intern workspace. Pull or copy:
- AppointmentsController.cs
- PatientsController.cs  
- ClinicalChartController.cs
from the working tree if GitHub still has older stubs.
