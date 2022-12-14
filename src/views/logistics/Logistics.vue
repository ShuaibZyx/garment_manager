<template>
  <el-card>
    <div class="logistics">
      <el-alert
        title="添加物流信息"
        type="success"
        center
        :closable="false"
        style="width: 50%"
      />
      <el-form
        :model="logisticsForm"
        label-width="auto"
        ref="logisticsFormRef"
        class="logisticsForm"
        :rules="logisticsFormRules"
      >
        <el-form-item label="物流时间">
          <el-date-picker
            type="date"
            placeholder="请选择物流信息抵达日期(选填,默认为系统当前时间)"
            v-model="logisticsForm.create_time"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="订单编号" prop="order_id">
          <el-autocomplete
            placeholder="请输入想要查找的订单编号"
            v-model="queryInfo"
            :fetch-suggestions="searchSuggest"
            class="input-with-select"
            size="small"
            clearable
            autocomplete="on"
            value-key="value"
            :debounce="300"
            @change="logisticsForm.order_id = ''"
            @select="handOrderSelect"
            style="width: 100%"
          >
            <i class="el-icon-tickets" slot="prefix" />
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="地区信息" prop="city_code">
          <el-cascader
            style="width: 100%"
            v-model="logisticsForm.city_code"
            :options="citys"
            size="small"
            filterable
            clearable
            :props="{ expandTrigger: 'hover' }"
          />
        </el-form-item>
        <el-form-item label="地区详细信息" prop="location">
          <el-input
            type="textarea"
            placeholder="请输入所在地区详细信息"
            v-model="logisticsForm.location"
            maxlength="200"
            size="small"
            show-word-limit
            clearable
            rows="4"
          />
        </el-form-item>
      </el-form>
      <div>
        <el-button size="small" @click="resetLogisticsForm">取 消</el-button>
        <el-button type="primary" size="small" @click="addLogistics"
          >确 定</el-button
        >
      </div>
      <el-divider />
      <div class="operation">
        <span class="title">当前订单编号:{{ orderId }}</span>
        <div class="table" v-if="orderLogisticsList.length > 0">
          <el-table
            :data="orderLogisticsList"
            style="width: 100%"
            fit
            lazy
            :stripe="true"
            :border="true"
            :highlight-current-row="true"
            empty-text="暂无数据"
            tooltip-effect="dark"
          >
            <el-table-column
              type="index"
              label="序号"
              align="center"
              width="50"
            />

            <el-table-column align="center" label="所属地区">
              <template slot-scope="scope">
                {{ scope.row.city_code | cityFormat }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="location" label="详细地址" />
            <el-table-column align="center" label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.create_time | dateFormat }}
              </template>
            </el-table-column>
            <el-table-column align="center" width="140" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  plain
                  @click="deleteLogistics(scope.row.logistics_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 暂无数据填充 -->
        <el-empty description="暂无数据" v-else />
      </div>
    </div>
  </el-card>
</template>

<script>
import citys from "../../assets/js/citys";
export default {
  name: "Logistics",
  data() {
    return {
      //物流地址对象
      logisticsForm: {
        order_id: "",
        city_code: "",
        location: "",
        create_time: "",
      },
      //物流地址验证规则
      logisticsFormRules: {
        city_code: [
          {
            required: true,
            message: "请选择您的地区信息",
            trigger: ["blur", "change"],
          },
        ],
        location: [
          {
            required: true,
            message: "请输入您的详细地址信息",
            trigger: "blur",
          },
        ],
        order_id: [
          {
            required: true,
            message: "订单编号不可为空",
            trigger: ["blur", "change"],
          },
        ],
      },
      //级联选择器可选城市
      citys,
      //搜索订单信息的条件
      queryInfo: "",
      //订单Id
      orderId: "",
      //当前订单下的所有物流地址
      orderLogisticsList: [],
      //搜索物流信息的条件
      logisticsSearch: "",
    };
  },
  methods: {
    //选中订单时的处理方法
    handOrderSelect(order) {
      this.logisticsForm.order_id = order.value;
    },

    //根据条件获取订单列表
    async searchSuggest(queryString, callback) {
      //定义一个空数组
      var list = [];
      const { data: orderIdsRes } = await this.$http.get(
        "order/ids/" + queryString
      );
      //如果获取搜索条件成功，则将条件名推入下拉框数组中
      if (orderIdsRes.code === 200) {
        orderIdsRes.data.forEach((order) => {
          list.push({
            value: order.order_id,
          });
        });
      }
      callback(list);
    },

    //重置表单信息
    resetLogisticsForm() {
      Object.keys(this.logisticsForm).forEach(
        (key) => (this.logisticsForm[key] = "")
      );
      this.queryInfo = "";
      this.$refs.logisticsFormRef.resetFields();
      this.$message({
        message: "重置成功!请重新输入",
        type: "success",
        center: true,
      });
    },

    //添加物流信息方法
    addLogistics() {
      this.$refs.logisticsFormRef.validate(async (valid) => {
        if (!valid) return;
        var logisticsObj = {};
        Object.assign(logisticsObj, this.logisticsForm);
        logisticsObj.city_code = logisticsObj.city_code.join("-");
        const { data: addLogisticsRes } = await this.$http.post(
          "logistics/add",
          {
            logisticsObj,
          }
        );
        Object.keys(this.logisticsForm).forEach(
          (key) => (this.logisticsForm[key] = "")
        );
        this.queryInfo = "";
        this.$refs.logisticsFormRef.resetFields();
        this.$message({
          message: `${
            addLogisticsRes.code !== 200
              ? "添加物流地址失败!"
              : "添加物流地址成功!"
          }`,
          type: `${addLogisticsRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
      });
    },

    //根据订单Id获取物流信息
    async getLogisticsByOrderId() {
      if (this.orderId.toString().length < 19) return;
      const { data: logisticsListRes } = await this.$http.get(
        "logistics/infoes/" + this.orderId
      );
      for (let i = 0; i < logisticsListRes.data.length; i++) {
        logisticsListRes.data[i].city_code =
          logisticsListRes.data[i].city_code.split("-");
      }
      this.orderLogisticsList = logisticsListRes.data;
    },

    //删除物流信息方法
    async deleteLogistics(logistics_id) {
      const { data: deleteLogisticsRes } = await this.$http.delete(
        "logistics/delete/" + logistics_id
      );
      this.this.$message({
        message: `${
          deleteLogisticsRes.code !== 200
            ? "删除物流信息失败"
            : "删除物流信息成功!"
        }`,
        type: `${deleteLogisticsRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },
  },
  mounted() {
    this.orderId = this.$route.params.orderId;
    this.getLogisticsByOrderId();
  },
};
</script>

