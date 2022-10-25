<template>
  <el-card>
    <div class="hire">
      <el-alert
        title="租赁信息管理"
        type="success"
        center
        :closable="false"
        style="width: 50%"
      />
      <div class="operation">
        <el-button type="danger" size="small" plain @click="deleteSelectedHires"
          >删除已选中</el-button
        >
      </div>
      <div class="table">
        <el-table
          :data="
            hireList.filter(
              (data) => !hireSearch || data.renter?.account.includes(hireSearch)
            )
          "
          style="width: 100%"
          fit
          lazy
          :stripe="true"
          :border="true"
          :highlight-current-row="true"
          empty-text="暂无数据"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="expand">
            <template slot-scope="scope">
              <div class="expand_content">
                <el-descriptions title="租赁信息" :column="3">
                  <el-descriptions-item label="租赁编号">{{
                    scope.row.hire_id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="租赁人">
                    {{ scope.row.renter_id }}</el-descriptions-item
                  >
                  <el-descriptions-item label="服装编号">
                    {{ scope.row.garment_id }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>

          <el-table-column type="selection" align="center" />

          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="50"
          />

          <el-table-column label="租赁人" align="center">
            <template slot-scope="scope">
              {{
                scope.row.renter.nickname + "(" + scope.row.renter.account + ")"
              }}
            </template>
          </el-table-column>

          <el-table-column label="租赁服装" align="center">
            <template slot-scope="scope">
              {{
                scope.row.garment.name +
                "类型:(" +
                scope.row.garment.category +
                ")"
              }}
            </template>
          </el-table-column>

          <el-table-column label="租赁时长" align="center" width="100">
            <template slot-scope="scope">
              <el-tag type="primary">{{ scope.row.day }}天</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="租价" align="center" width="120">
            <template slot-scope="scope">
              <el-tag type="primary">{{ scope.row.total_price }}元</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="租赁时间" align="center">
            <template slot-scope="scope">
              {{ scope.row.create_time | dateFormat }}
            </template>
          </el-table-column>

          <el-table-column align="center">
            <template slot="header">
              <el-input
                v-model="hireSearch"
                size="mini"
                placeholder="输入租赁者账号进行搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                @click="showAddOrderDialog(scope.row)"
                >添加订单</el-button
              >
              <el-popconfirm
                title="确定删除该租赁信息?此操作不可逆"
                style="margin-left: 10px"
                @confirm="deleteHire(scope.row)"
              >
                <el-button slot="reference" type="danger" size="mini" plain
                  >删除</el-button
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div class="page">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.pageNumber"
            :page-sizes="[8, 12, 24]"
            :page-size="page.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
            background
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 添加订单信息的Dialog -->
    <el-dialog
      :visible.sync="orderDialogVisiable"
      width="50%"
      :close-on-click-modal="false"
      @close="resetOrderForm"
      custom-class="orderFormDialog"
    >
      <div slot="title" class="title">
        <i class="el-icon-edit"></i>
        <span> 添加订单</span>
      </div>
      <el-descriptions title="租赁信息" border :column="2">
        <el-descriptions-item label="租赁Id">{{
          currentOrderHire.hire_id
        }}</el-descriptions-item>
        <el-descriptions-item label="租赁时长"
          ><el-tag>{{ currentOrderHire.day }}天</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="租价"
          ><el-tag
            >{{ currentOrderHire.total_price }}元</el-tag
          ></el-descriptions-item
        >
        <el-descriptions-item label="租赁时间">{{
          currentOrderHire.create_time | dateFormat
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="orderForm">
        <span class="title">订单信息</span>
        <el-form
          :model="orderForm"
          label-width="auto"
          ref="orderFormRef"
          :rules="orderFormRules"
        >
          <el-form-item label="租赁信息Id">
            <el-input :value="orderForm.hire_id" size="small" readonly>
            </el-input>
          </el-form-item>
          <el-form-item label="订单价格" prop="cost">
            <el-input
              v-model.number="orderForm.cost"
              type="number"
              size="small"
              clearable
              placeholder="订单价格"
            >
              <i slot="suffix">元(默认为租赁价格)</i>
            </el-input>
          </el-form-item>
          <el-form-item label="发货地址" prop="location_send">
            <el-autocomplete
              placeholder="请输入想要查找的用户详细地址关键字"
              v-model="queryInfo"
              :fetch-suggestions="searchSuggest"
              class="input-with-select"
              size="small"
              clearable
              autocomplete="on"
              value-key="address"
              :debounce="300"
              @change="orderForm.location_send = ''"
              @select="handOwnerSelect"
              style="width: 100%"
            >
              <i class="el-icon-location-outline" slot="prefix" />
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="快递公司" prop="express_company">
            <el-select
              v-model="orderForm.express_company"
              filterable
              size="small"
              autocomplete="off"
              clearable
              placeholder="请选择快递公司"
              style="width: 100%"
            >
              <el-option
                v-for="item in expressCompanies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="快递单号" prop="express_id">
            <el-input
              v-model="orderForm.express_id"
              maxlength="17"
              size="small"
              clearable
              placeholder="请填写快递单号"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="订单状态" prop="state">
            <el-select
              v-model="orderForm.state"
              filterable
              size="small"
              clearable
              placeholder="请选择订单状态"
              style="width: 100%"
            >
              <el-option
                v-for="item in orderState"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="cartonDialogFooter">
        <el-button size="small" @click="orderDialogVisiable = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="addOrder"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import citys from "../../assets/js/citys";
export default {
  name: "Hire",
  data() {
    return {
      //租赁信息列表
      hireList: [],
      //已选中的租赁信息列表
      hireIdList: [],
      //搜索租赁信息列表的条件
      hireSearch: "",
      //分页所用对象
      page: {
        pageNumber: 1,
        pageSize: 8,
        total: 0,
      },
      //创建订单的Dialog可见性
      orderDialogVisiable: false,
      //创建订单的对象
      orderForm: {
        cost: "",
        hire_id: "",
        state: 0,
        express_company: "",
        express_id: "",
        //服装拥有者地址-->发货地址
        location_send: "",
        //服装租赁者地址-->收货地址
        location_receive: "",
      },
      //创建订单时的表单验证规则
      orderFormRules: {
        cost: [
          {
            required: true,
            message: "订单价格不可为空",
            trigger: ["blur", "change"],
          },
          {
            max: 3650000,
            min: 0,
            type: "number",
            trigger: ["blur", "change"],
            message: "订单价格不符合规定",
          },
        ],
        express_company: [
          {
            required: true,
            message: "快递公司不可为空",
            trigger: ["blur", "change"],
          },
        ],
        state: [
          {
            required: true,
            message: "订单状态不可为空",
            trigger: ["blur", "change"],
          },
        ],
        express_id: [
          {
            required: true,
            message: "快递单号不可为空",
            trigger: ["blur", "change"],
          },
        ],
        location_send: [
          {
            required: true,
            message: "发货地址不可为空",
            trigger: ["blur", "change"],
          },
        ],
      },
      //可选的快递公司
      expressCompanies: [
        { label: "顺丰速递", value: "顺丰速递" },
        { label: "中国邮政EMS", value: "中国邮政EMS" },
        { label: "中通快递", value: "中通快递" },
        { label: "韵达快递", value: "韵达快递" },
        { label: "圆通速递", value: "圆通速递" },
        { label: "申通快递", value: "申通快递" },
        { label: "德邦快递", value: "德邦快递" },
        { label: "极兔速递", value: "极兔速递" },
      ],
      //可选订单状态
      orderState: [
        { label: "待付款", value: 0 },
        { label: "待发货", value: 1 },
        { label: "待收货", value: 2 },
        { label: "待评价", value: 3 },
        { label: "已关闭", value: 4 },
      ],
      //当前操作的租赁信息对象
      currentOrderHire: {},
      //级联选择器城市
      citys,
      //搜索发货的用户的发货地址关键字
      queryInfo: "",
    };
  },
  methods: {
    //分页获取所有租赁信息
    async getHires() {
      this.getHireCountKey();
      const { data: hireListRes } = await this.$http.post("hire/infoes", {
        pageNumber: this.page.pageNumber,
        pageSize: this.page.pageSize,
      });
      this.hireList = hireListRes.data;
    },

    //获取条件下所有租赁信息数量
    async getHireCountKey() {
      const { data: hireCountRes } = await this.$http.get("hire/count");
      this.page.total = parseInt(hireCountRes.data[0].total);
    },

    //处理页面大小发生变化的方法
    handleSizeChange(newSize) {
      const temporaryTotal = this.page.pageSize * this.page.pageNumber;
      this.page.pageSize = newSize;
      this.page.pageNumber = temporaryTotal / this.page.pageSize + 1;
      this.getHires();
    },

    //处理当前页码发生变化的方法
    handleCurrentChange(newPage) {
      this.page.pageNumber = newPage;
      this.getHires();
    },

    //处理列表第一行选择按钮
    handleSelectionChange(value) {
      this.hireIdList = value;
    },

    //删除单个租赁信息
    async deleteHire(hire) {
      const { data: deleteHireRes } = await this.$http.post("hire/delete", {
        hire_id: hire.hire_id,
        garment_id: hire.garment_id,
      });
      this.getHires();
      this.$message({
        message: `${
          deleteHireRes.code !== 200 ? "删除租赁信息失败" : "删除租赁信息成功!"
        }`,
        type: `${deleteHireRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //删除已选中的租赁信息行
    deleteSelectedHires() {
      if (this.hireIdList.length <= 0) {
        this.$message({
          message: "请选择租赁信息列表行",
          type: "warning",
          center: true,
        });
        return;
      }
      this.$confirm("永久删除这些租赁信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(async () => {
          var hireIds = [];
          var garmentIds = [];
          this.hireIdList.forEach((hire) => {
            hireIds.push(hire.hire_id);
            garmentIds.push(hire.garment_id);
          });
          const { data: deleteHiresRes } = await this.$http.post(
            "hire/deletes",
            {
              hireIds,
              garmentIds,
            }
          );
          this.getHires();
          this.$message({
            message: `${
              deleteHiresRes.code !== 200
                ? "删除租赁信息失败"
                : "删除租赁信息成功!"
            }`,
            type: `${deleteHiresRes.code !== 200 ? "error" : "success"}`,
            center: true,
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
            center: true,
          });
        });
    },

    //显示创建订单的dialog并填入数据
    async showAddOrderDialog(hire) {
      this.orderForm.hire_id = hire.hire_id;
      this.orderForm.cost = hire.total_price;
      this.orderForm.state = 0;
      const { data: addressRes } = await this.$http.get(
        "order/hire/renter/address/" + hire.hire_id
      );
      if (addressRes.code === 200) {
        this.orderForm.location_receive =
          this.getLocationTransform(addressRes.data[0].city_code.split("-")) +
          "/" +
          addressRes.data[0].location;
      }
      this.currentOrderHire = hire;
      this.orderDialogVisiable = true;
    },

    //根据条件获取服装拥有者用户地址列表
    async searchSuggest(queryString, callback) {
      //定义一个空数组
      var list = [];
      const { data: userAddressSearchRes } = await this.$http.get(
        "user/address/" + this.currentOrderHire.owner_id + "/" + queryString
      );
      //如果获取搜索条件成功，则将条件名推入下拉框数组中
      if (userAddressSearchRes.code === 200) {
        userAddressSearchRes.data.forEach((address) => {
          list.push({
            value:
              this.getLocationTransform(address.city_code.split("-")) +
              "/" +
              address.location,
            address:
              this.getLocationTransform(address.city_code.split("-")) +
              "/" +
              address.location,
          });
        });
      }
      callback(list);
    },

    //处理选中发货地址的方法
    handOwnerSelect(address) {
      this.orderForm.location_send = address.value;
    },

    //关闭创建订单的Dialog时触发
    resetOrderForm() {
      this.currentOrderHire = {};
      Object.keys(this.orderForm).forEach((key) => (this.orderForm[key] = ""));
      this.queryInfo = "";
      this.$refs.orderFormRef.resetFields();
    },

    //创建订单的方法
    addOrder() {
      this.$refs.orderFormRef.validate(async (valid) => {
        if (!valid) return;
        var orderObj = {};
        Object.assign(orderObj, this.orderForm);
        const { data: addOrderRes } = await this.$http.post("order/add", {
          orderObj,
        });
        this.orderDialogVisiable = false;
        this.$message({
          message: `${
            addOrderRes.code !== 200 ? "创建订单失败!" : "创建订单成功!"
          }`,
          type: `${addOrderRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
      });
    },

    //将用户的城市编号转化为中文显示
    getLocationTransform(cityArr) {
      //将所需要的城市编码信息列出来
      const location = cityArr;
      const locationProvince = location[0];
      const locationCity = location[1];
      const locationArea = location[2];
      //创建数组保存查询到的数组，减少查询次数
      var provinceArr = [];
      var cityArr = [];
      //最后用于存放城市中文字符的字符串
      var tansformLocation = "";
      //第一次得到省和市级数组
      this.citys.forEach((item) => {
        if (item.value === locationProvince) {
          tansformLocation = tansformLocation + item.label;
          provinceArr = item.children;
        }
      });
      //第二次得到市和区域级数组
      provinceArr.forEach((item) => {
        if (item.value === locationCity) {
          tansformLocation = tansformLocation + "/" + item.label;
          cityArr = item.children;
        }
      });
      //第三次得到完整省市区字符串
      cityArr.forEach((item) => {
        if (item.value === locationArea) {
          tansformLocation = tansformLocation + "/" + item.label;
        }
      });
      //返回该字符串
      return tansformLocation;
    },
  },
  mounted() {
    this.getHires();
  },
};
</script>
