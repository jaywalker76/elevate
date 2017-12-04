import { Component, OnInit } from '@angular/core';
import { UserSettingsService } from "../shared/services/user-settings/user-settings.service";
import { IUserSettings, IUserZones } from "../../../../common/scripts/interfaces/IUserSettings";
import { IZone } from "../../../../common/scripts/interfaces/IActivityData";
import * as _ from "lodash";
import { ZONE_DEFINITIONS } from "./zone-definitions";
import { ZonesService } from "./shared/zones.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AppRoutes } from "../shared/modules/app-routes.model";
import { userSettings } from "../../../../common/scripts/UserSettings";
import { ZoneDefinition } from "../shared/models/zone-definition.model";

@Component({
	selector: 'app-zones-settings',
	templateUrl: './zones-settings.component.html',
	styleUrls: ['./zones-settings.component.scss']
})
export class ZonesSettingsComponent implements OnInit {

	public static DEFAULT_ZONE_VALUE: string = "speed";

	private _zoneDefinitions: ZoneDefinition[] = ZONE_DEFINITIONS;
	private _zoneDefinitionSelected: ZoneDefinition;
	private _userZones: IUserZones;
	private _currentZones: IZone[];

	constructor(private userSettingsService: UserSettingsService,
				private route: ActivatedRoute,
				private router: Router,
				private zonesService: ZonesService) {
	}

	public ngOnInit(): void {

		// Load user zones config
		this.userSettingsService.fetch().then((userSettingsSynced: IUserSettings) => {

			// Load user zones data
			this._userZones = userSettingsSynced.zones;

			// Check zoneValue provided in URL
			this.route.params.subscribe(routeParams => {

				let zoneDefinition: ZoneDefinition = null;

				const hasZoneValueInRoute = !_.isEmpty(routeParams.zoneValue);

				if (hasZoneValueInRoute && _.has(userSettings.zones, routeParams.zoneValue)) {

					zoneDefinition = this.getZoneDefinitionFromZoneValue(routeParams.zoneValue);

				} else {
					this.navigateToZone(ZonesSettingsComponent.DEFAULT_ZONE_VALUE);
					return;
				}

				this.loadZonesFromDefinition(zoneDefinition);
			});

		});

		// Listen for reload request from ZonesService
		// This happen when ZoneService perform a resetZonesToDefault of a zones set.
		this.zonesService.zonesUpdates.subscribe((updatedZones: IZone[]) => {
			this._currentZones = updatedZones;
		});
	}

	/**
	 *
	 * @param {string} zoneValue
	 * @returns {ZoneDefinition}
	 */
	private getZoneDefinitionFromZoneValue(zoneValue: string): ZoneDefinition {
		return _.find(this.zoneDefinitions, {value: zoneValue});
	}

	/**
	 * Load current zones from a zone definition.
	 * Also update the current zones managed by the zone service to add, remove, reset, import, export, ... zones.
	 * @param {ZoneDefinition} zoneDefinition
	 * @param {string} overrideDefinitionTrigger
	 */
	private loadZonesFromDefinition(zoneDefinition: ZoneDefinition) {

		// Load current zone from zone definition provided
		this.currentZones = _.propertyOf(this._userZones)(zoneDefinition.value);

		// Update current zones & zone definition managed by the zones service
		this.zonesService.currentZones = this.currentZones;
		this.zonesService.zoneDefinition = zoneDefinition;

		// Update the zone definition used
		this.zoneDefinitionSelected = zoneDefinition;
	}

	/**
	 *
	 */
	public onZoneDefinitionSelected(zoneDefinition: ZoneDefinition) {
		this.navigateToZone(zoneDefinition.value);
	}

	private navigateToZone(zoneValue: string) {
		const selectedZoneUrl = AppRoutes.zonesSettings + "/" + zoneValue;
		this.router.navigate([selectedZoneUrl]);
	}

	get currentZones(): IZone[] {
		return this._currentZones;
	}

	set currentZones(value: IZone[]) {
		this._currentZones = value;
	}

	get zoneDefinitions(): ZoneDefinition[] {
		return this._zoneDefinitions;
	}

	set zoneDefinitions(value: ZoneDefinition[]) {
		this._zoneDefinitions = value;
	}

	get zoneDefinitionSelected(): ZoneDefinition {
		return this._zoneDefinitionSelected;
	}

	set zoneDefinitionSelected(value: ZoneDefinition) {
		this._zoneDefinitionSelected = value;
	}


}
