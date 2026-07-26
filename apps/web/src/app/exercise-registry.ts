import ddlAirportGateForeignKey from '@db-dojo/exercise-ddl-airport-gate-foreign-key';
import ddlBikeRentalFleetAlter from '@db-dojo/exercise-ddl-bike-rental-fleet-alter';
import ddlBreweryBatchIndexes from '@db-dojo/exercise-ddl-brewery-batch-indexes';
import ddlCreateLibraryBookTable from '@db-dojo/exercise-ddl-create-library-book-table';
import ddlFlightCrewCompositeKey from '@db-dojo/exercise-ddl-flight-crew-composite-key';
import ddlHarborContainerTrackingIndexes from '@db-dojo/exercise-ddl-harbor-container-tracking-indexes';
import ddlHospitalReferentialActions from '@db-dojo/exercise-ddl-hospital-referential-actions';
import ddlMuseumScanTruncate from '@db-dojo/exercise-ddl-museum-scan-truncate';
import ddlObservatoryBookingGuardrails from '@db-dojo/exercise-ddl-observatory-booking-guardrails';
import ddlPharmacyInventoryDatatypes from '@db-dojo/exercise-ddl-pharmacy-inventory-datatypes';
import ddlVineyardSchemaMigration from '@db-dojo/exercise-ddl-vineyard-schema-migration';
import ddlWorkshopRepairOrderConstraints from '@db-dojo/exercise-ddl-workshop-repair-order-constraints';
import dmlDeleteCancelledFlightStandby from '@db-dojo/exercise-dml-delete-cancelled-flight-standby';
import dmlDeleteDuplicateStarReadings from '@db-dojo/exercise-dml-delete-duplicate-star-readings';
import dmlDeleteExpiredLockerRentals from '@db-dojo/exercise-dml-delete-expired-locker-rentals';
import dmlInsertBreweryTastingQueue from '@db-dojo/exercise-dml-insert-brewery-tasting-queue';
import dmlInsertLibraryLoans from '@db-dojo/exercise-dml-insert-library-loans';
import dmlInsertMuseumRestorationQueue from '@db-dojo/exercise-dml-insert-museum-restoration-queue';
import dmlUpdateBikeWinterTariff from '@db-dojo/exercise-dml-update-bike-winter-tariff';
import dmlUpdateGreenhouseMoistureSummary from '@db-dojo/exercise-dml-update-greenhouse-moisture-summary';
import dmlUpdateWorkshopLabourRates from '@db-dojo/exercise-dml-update-workshop-labour-rates';
import dmlWarehouseDeliveryReconciliation from '@db-dojo/exercise-dml-warehouse-delivery-reconciliation';
import integrityBakeryCodeNormalizer from '@db-dojo/exercise-integrity-bakery-code-normalizer';
import integrityBroadcastSlotClash from '@db-dojo/exercise-integrity-broadcast-slot-clash';
import integrityDrivingSchoolLessonRules from '@db-dojo/exercise-integrity-driving-school-lesson-rules';
import integrityGalleryNoPriceCut from '@db-dojo/exercise-integrity-gallery-no-price-cut';
import integrityGymMembershipWindowCheck from '@db-dojo/exercise-integrity-gym-membership-window-check';
import integrityHostelInsteadOfUpdate from '@db-dojo/exercise-integrity-hostel-instead-of-update';
import integrityLedgerDeferredBalance from '@db-dojo/exercise-integrity-ledger-deferred-balance';
import integrityPostalSortingStats from '@db-dojo/exercise-integrity-postal-sorting-stats';
import integrityRoasteryBatchLimits from '@db-dojo/exercise-integrity-roastery-batch-limits';
import integrityShelterAdoptionAudit from '@db-dojo/exercise-integrity-shelter-adoption-audit';
import integritySubstationStatusLog from '@db-dojo/exercise-integrity-substation-status-log';
import type { ExerciseModule } from '@db-dojo/exercise-kit';
import normalizationOrders3nf from '@db-dojo/exercise-normalization-orders-3nf';
import permissionsAnalyst from '@db-dojo/exercise-permissions-analyst';
import permissionsColumnLevelPersonnel from '@db-dojo/exercise-permissions-column-level-personnel';
import permissionsDefaultPrivilegesAnalytics from '@db-dojo/exercise-permissions-default-privileges-analytics';
import permissionsGrantOptionAuditChain from '@db-dojo/exercise-permissions-grant-option-audit-chain';
import permissionsLawfirmSelfServiceTimesheet from '@db-dojo/exercise-permissions-lawfirm-self-service-timesheet';
import permissionsNurseVitalsWrite from '@db-dojo/exercise-permissions-nurse-vitals-write';
import permissionsPublicOpeningHours from '@db-dojo/exercise-permissions-public-opening-hours';
import permissionsRevokeCascadeContractor from '@db-dojo/exercise-permissions-revoke-cascade-contractor';
import permissionsRevokeInternWrite from '@db-dojo/exercise-permissions-revoke-intern-write';
import permissionsRoleHierarchySchool from '@db-dojo/exercise-permissions-role-hierarchy-school';
import permissionsViewShieldsDrafts from '@db-dojo/exercise-permissions-view-shields-drafts';
import permissionsWarehouseAdminAll from '@db-dojo/exercise-permissions-warehouse-admin-all';
import plpgsqlAirportGateLookup from '@db-dojo/exercise-plpgsql-airport-gate-lookup';
import plpgsqlBreweryBottlingSlots from '@db-dojo/exercise-plpgsql-brewery-bottling-slots';
import plpgsqlCarwashBayDrainSimulation from '@db-dojo/exercise-plpgsql-carwash-bay-drain-simulation';
import plpgsqlClinicCheckinProcedure from '@db-dojo/exercise-plpgsql-clinic-checkin-procedure';
import plpgsqlFerryCrossingManifest from '@db-dojo/exercise-plpgsql-ferry-crossing-manifest';
import plpgsqlGreenhouseHotStreak from '@db-dojo/exercise-plpgsql-greenhouse-hot-streak';
import plpgsqlLibraryLateFee from '@db-dojo/exercise-plpgsql-library-late-fee';
import plpgsqlObservatorySlotPlan from '@db-dojo/exercise-plpgsql-observatory-slot-plan';
import plpgsqlVineyardBarrelGrading from '@db-dojo/exercise-plpgsql-vineyard-barrel-grading';
import plpgsqlWarehouseFifoPicking from '@db-dojo/exercise-plpgsql-warehouse-fifo-picking';
import plpgsqlWorkshopRepairTier from '@db-dojo/exercise-plpgsql-workshop-repair-tier';
import sqlAirportGatesWithoutDepartures from '@db-dojo/exercise-sql-airport-gates-without-departures';
import sqlAquariumWaterMetrics from '@db-dojo/exercise-sql-aquarium-water-metrics';
import sqlBikeRentalPriceList from '@db-dojo/exercise-sql-bike-rental-price-list';
import sqlBreweryBeerStyles from '@db-dojo/exercise-sql-brewery-beer-styles';
import sqlCinemaWeeklyBoxOfficeRank from '@db-dojo/exercise-sql-cinema-weekly-box-office-rank';
import sqlClinicFullyCertifiedNurses from '@db-dojo/exercise-sql-clinic-fully-certified-nurses';
import sqlDealershipTestDriveHoldouts from '@db-dojo/exercise-sql-dealership-test-drive-holdouts';
import sqlDronePartsExplosion from '@db-dojo/exercise-sql-drone-parts-explosion';
import sqlFestivalSingleStageArtists from '@db-dojo/exercise-sql-festival-single-stage-artists';
import sqlLibraryShelfSearch from '@db-dojo/exercise-sql-library-shelf-search';
import sqlLoginStreaks from '@db-dojo/exercise-sql-login-streaks';
import sqlMarathonTopFinishers from '@db-dojo/exercise-sql-marathon-top-finishers';
import sqlMuseumGuideLanguagePairs from '@db-dojo/exercise-sql-museum-guide-language-pairs';
import sqlOrders from '@db-dojo/exercise-sql-orders';
import sqlVineyardBestLotPerRegion from '@db-dojo/exercise-sql-vineyard-best-lot-per-region';
import sqlWorkshopRepairHours from '@db-dojo/exercise-sql-workshop-repair-hours';
import umlLibraryClassDiagram from '@db-dojo/exercise-uml-library-class-diagram';
import umlOrdersRelationalMapping from '@db-dojo/exercise-uml-orders-relational-mapping';
import viewsAirportDepartureBoard from '@db-dojo/exercise-views-airport-departure-board';
import viewsBreweryActiveBatches from '@db-dojo/exercise-views-brewery-active-batches';
import viewsClinicWardOccupancy from '@db-dojo/exercise-views-clinic-ward-occupancy';
import viewsDepotUpdatableRoster from '@db-dojo/exercise-views-depot-updatable-roster';
import viewsFestivalCrewPrivacy from '@db-dojo/exercise-views-festival-crew-privacy';
import viewsGarageStaffGeneralisation from '@db-dojo/exercise-views-garage-staff-generalisation';
import viewsLibraryPublicCatalogue from '@db-dojo/exercise-views-library-public-catalogue';
import viewsMuseumPartitionModel from '@db-dojo/exercise-views-museum-partition-model';
import viewsObservatoryInsteadOfInsert from '@db-dojo/exercise-views-observatory-instead-of-insert';
import viewsUniversityCourseEnrollmentSummary from '@db-dojo/exercise-views-university-course-enrollment-summary';
import viewsVineyardHarvestSnapshot from '@db-dojo/exercise-views-vineyard-harvest-snapshot';

export const exerciseModules: ExerciseModule[] = [
  ddlCreateLibraryBookTable,
  ddlWorkshopRepairOrderConstraints,
  ddlBikeRentalFleetAlter,
  ddlAirportGateForeignKey,
  ddlBreweryBatchIndexes,
  ddlMuseumScanTruncate,
  ddlFlightCrewCompositeKey,
  ddlHospitalReferentialActions,
  ddlVineyardSchemaMigration,
  ddlObservatoryBookingGuardrails,
  ddlHarborContainerTrackingIndexes,
  ddlPharmacyInventoryDatatypes,

  dmlInsertLibraryLoans,
  dmlUpdateWorkshopLabourRates,
  dmlDeleteExpiredLockerRentals,
  dmlInsertBreweryTastingQueue,
  dmlUpdateBikeWinterTariff,
  dmlDeleteCancelledFlightStandby,
  dmlInsertMuseumRestorationQueue,
  dmlUpdateGreenhouseMoistureSummary,
  dmlDeleteDuplicateStarReadings,
  dmlWarehouseDeliveryReconciliation,

  sqlOrders,
  sqlBreweryBeerStyles,
  sqlLibraryShelfSearch,
  sqlBikeRentalPriceList,
  sqlAirportGatesWithoutDepartures,
  sqlWorkshopRepairHours,
  sqlFestivalSingleStageArtists,
  sqlMuseumGuideLanguagePairs,
  sqlVineyardBestLotPerRegion,
  sqlClinicFullyCertifiedNurses,
  sqlDronePartsExplosion,
  sqlLoginStreaks,
  sqlAquariumWaterMetrics,
  sqlDealershipTestDriveHoldouts,
  sqlMarathonTopFinishers,
  sqlCinemaWeeklyBoxOfficeRank,

  viewsLibraryPublicCatalogue,
  viewsBreweryActiveBatches,
  viewsAirportDepartureBoard,
  viewsClinicWardOccupancy,
  viewsFestivalCrewPrivacy,
  viewsGarageStaffGeneralisation,
  viewsMuseumPartitionModel,
  viewsVineyardHarvestSnapshot,
  viewsDepotUpdatableRoster,
  viewsObservatoryInsteadOfInsert,
  viewsUniversityCourseEnrollmentSummary,

  plpgsqlLibraryLateFee,
  plpgsqlBreweryBottlingSlots,
  plpgsqlAirportGateLookup,
  plpgsqlWorkshopRepairTier,
  plpgsqlClinicCheckinProcedure,
  plpgsqlFerryCrossingManifest,
  plpgsqlGreenhouseHotStreak,
  plpgsqlVineyardBarrelGrading,
  plpgsqlObservatorySlotPlan,
  plpgsqlWarehouseFifoPicking,
  plpgsqlCarwashBayDrainSimulation,

  integrityRoasteryBatchLimits,
  integrityBakeryCodeNormalizer,
  integrityShelterAdoptionAudit,
  integrityDrivingSchoolLessonRules,
  integrityGalleryNoPriceCut,
  integrityPostalSortingStats,
  integrityBroadcastSlotClash,
  integritySubstationStatusLog,
  integrityHostelInsteadOfUpdate,
  integrityLedgerDeferredBalance,
  integrityGymMembershipWindowCheck,

  permissionsNurseVitalsWrite,
  permissionsRevokeInternWrite,
  permissionsPublicOpeningHours,
  permissionsAnalyst,
  permissionsColumnLevelPersonnel,
  permissionsWarehouseAdminAll,
  permissionsViewShieldsDrafts,
  permissionsRevokeCascadeContractor,
  permissionsGrantOptionAuditChain,
  permissionsRoleHierarchySchool,
  permissionsLawfirmSelfServiceTimesheet,
  permissionsDefaultPrivilegesAnalytics,

  umlLibraryClassDiagram,
  umlOrdersRelationalMapping,
  normalizationOrders3nf
];
