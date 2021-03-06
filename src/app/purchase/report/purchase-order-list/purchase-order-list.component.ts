import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { IMyOptions, IMyDateModel } from 'mydatepicker-th';
import * as _ from 'lodash';
import * as moment from 'moment';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { PurchasingOrderService } from '../../share/purchasing-order.service';
import { BudgetTypeService } from '../../share/budget-type.service';
import { log } from 'util';
import { decode } from 'punycode';
import { AlertService } from 'app/alert.service';
import { ModalLoadingComponent } from 'app/modal-loading/modal-loading.component';
import { HtmlPreviewComponent } from 'app/helper/html-preview/html-preview.component';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.css']
})
export class PurchaseOrderListComponent implements OnInit {

  @ViewChild('htmlPreview') public htmlPreview: HtmlPreviewComponent;
  @ViewChild('modalLoading') modalLoading: ModalLoadingComponent;

  budgetSubType = [];
  purchaseOrder = [];

  startDate: any;
  endDate: any;
  token: any;

  bgtypesub_id: any;


  myDatePickerOptions: IMyOptions = {
    dateFormat: 'dd mmm yyyy',
  }

  constructor(
    @Inject('API_URL') private apiUrl: string,
    private purchasingOrderService: PurchasingOrderService,
    private budgetTypeService: BudgetTypeService,
    private alertService: AlertService
  ) {
    this.token = sessionStorage.getItem('token');
  }

  ngOnInit() {
    const date = new Date();

    this.startDate = {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: 1
      }
    };
    this.endDate = {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };
    this.getBudgetType();
  }

  async getBudgetType() {
    try {
      const rs: any = await this.budgetTypeService.getSubType();
      if (rs.ok) {
        this.budgetSubType = rs.rows;
        console.log(this.budgetSubType)
        this.bgtypesub_id = this.budgetSubType[0].bgtypesub_id;
        this.getPo(this.bgtypesub_id);
      } else {
        this.alertService.error(rs.error);
      }

    } catch (error) {
      this.alertService.error(error.message);
    }
  }

  async changeType() {
    this.getPo(this.bgtypesub_id);
  }

  async getPo(bgtypesub_id: any) {
    this.modalLoading.show();
    try {
      const rs: any = await this.purchasingOrderService.getOrderList(bgtypesub_id);
      if (rs.ok) {
        this.purchaseOrder = rs.rows;
        this.modalLoading.hide();
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async printProduct(check: any) {
    if(check == 1){
      const startDate = `${this.startDate.date.year}-${this.startDate.date.month}-${this.startDate.date.day}`;
      const endDate = `${this.endDate.date.year}-${this.endDate.date.month}-${this.endDate.date.day}`;
      const url = `${this.apiUrl}/report/purchasing-list/${startDate}/${endDate}/${this.bgtypesub_id}?token=${this.token}`;
      this.htmlPreview.showReport(url);
    }
    if(check == 2){
      const startDate = `2017-1-1`;
      const endDate = `${this.endDate.date.year}-${this.endDate.date.month}-${this.endDate.date.day}`;
      const url = `${this.apiUrl}/report/purchasing-list/${startDate}/${endDate}/${this.bgtypesub_id}?token=${this.token}`;
      this.htmlPreview.showReport(url);
    }
  }
}
