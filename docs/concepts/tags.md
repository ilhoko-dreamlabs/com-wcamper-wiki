# 태그 표준(운영/추천/검색용)

용어 논쟁을 줄이고 추천·필터·안전·규정 리스크를 **속성값으로 분해**합니다.

## 핵심 태그
- **TripStructure**: ROUTE_MULTI_DAY / POINT_TO_POINT / BASECAMP
- **DrivingTerrain**: PAVED / GRAVEL / FOREST_ROAD / TRAIL
- **TrailDifficulty**: 1~5
- **SpotStatus**: DESIGNATED / NON_DESIGNATED
- **Remoteness**: CELL_GOOD / CELL_WEAK / NO_SIGNAL
- **RescueDistance**: <30m / 1h+ / 2h+
- **VehicleRequirement**: AWD_OK / 4WD_REQUIRED / LOW_RANGE_REQUIRED / WINCH_RECOMMENDED
- **ComplianceRisk**: LOW / MID / HIGH
- **SafetyRisk**: LOW / MID / HIGH  (규정 리스크와 분리)

## 권장 원칙
- “노지=불법” 같은 단정 대신 **ComplianceRisk**로 표현
- “오지”는 감성어가 아니라 **Remoteness 지표**로 표현
