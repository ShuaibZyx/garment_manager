<template>
  <el-card>
    <div class="order">
      <el-alert
        title="订单信息管理"
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
            orderList.filter(
              (data) =>
                !orderSearch || data.renter?.account.includes(orderSearch)
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
              <div
                class="expand_content"
                v-if="scope.row.hireInfo !== undefined"
              >
                <el-descriptions title="租赁信息" :column="4">
                  <el-descriptions-item label="租赁Id">{{
                    scope.row.hireInfo.hire_id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="租赁时长">
                    {{ scope.row.hireInfo.day }}天</el-descriptions-item
                  >
                  <el-descriptions-item label="租价">
                    {{ scope.row.hireInfo.total_price }}元
                  </el-descriptions-item>
                  <el-descriptions-item label="租赁时间">{{
                    scope.row.hireInfo.create_time | dateFormat
                  }}</el-descriptions-item>
                </el-descriptions>
                <el-descriptions
                  v-if="scope.row.garment !== undefined"
                  title="服装信息"
                  :column="4"
                >
                  <el-descriptions-item label="服装Id">{{
                    scope.row.garment.garment_id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="服装名称">
                    {{ scope.row.garment.name }}</el-descriptions-item
                  >
                  <el-descriptions-item label="分类">
                    {{ scope.row.garment.category }}</el-descriptions-item
                  >
                  <el-descriptions-item label="价格">
                    {{ scope.row.garment.hire_price }}元/天
                  </el-descriptions-item>
                </el-descriptions>
                <div v-else>服装信息跑路咯~😂</div>
                <el-descriptions
                  v-if="scope.row.renter !== undefined"
                  title="租赁用户"
                  :column="4"
                >
                  <el-descriptions-item label="昵称">{{
                    scope.row.renter.nickname
                  }}</el-descriptions-item>
                  <el-descriptions-item label="账号">
                    {{ scope.row.renter.account }}</el-descriptions-item
                  >
                  <el-descriptions-item label="用户Id">
                    {{ scope.row.renter.user_id }}</el-descriptions-item
                  >
                </el-descriptions>
                <div v-else>租赁人信息跑路咯~😂</div>
              </div>
              <div v-else>租赁信息跑路咯~😂</div>
            </template>
          </el-table-column>

          <el-table-column type="selection" align="center" />

          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="50"
          />

          <el-table-column label="订单用户" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.renter !== undefined">
                {{
                  scope.row.renter.nickname +
                  "(" +
                  scope.row.renter.account +
                  ")"
                }}
              </span>
              <span v-else>租赁信息跑路咯~😂</span>
            </template>
          </el-table-column>

          <el-table-column label="租赁服装" align="center" prop="hire_id">
            <template slot-scope="scope">
              <span v-if="scope.row.garment !== undefined">
                {{ scope.row.garment.name }}
              </span>
              <span v-else>租赁信息跑路咯~😂</span>
            </template>
          </el-table-column>

          <el-table-column label="费用" align="center" width="150">
            <template slot-scope="scope">
              <el-tag type="primary">{{ scope.row.cost }}元</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="订单状态" align="center" width="120">
            <template slot-scope="scope">
              <el-tag type="primary">{{
                scope.row.state | orderStateFormat
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" align="center">
            <template slot-scope="scope">
              {{ scope.row.create_time | dateFormat }}
            </template>
          </el-table-column>

          <el-table-column align="center" width="240">
            <template slot="header">
              <el-input
                v-model="orderSearch"
                size="mini"
                placeholder="输入租赁者账号进行搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                icon="el-icon-truck"
                @click="getLogisticsListByOrderId(scope.row.order_id)"
                >物流</el-button
              >
              <el-button
                v-if="scope.row.state !== 4"
                type="primary"
                size="mini"
                plain
                @click="finishOrder(scope.row)"
                >关闭</el-button
              >
              <el-popconfirm
                title="确定删除该订单信息?此操作不可逆"
                style="margin-left: 10px"
                @confirm="deleteOrder(scope.row)"
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

    <!-- 订单物流信息dialog -->
    <el-dialog
      :visible.sync="logisticsListVisiable"
      @close="logisticsList = []"
      custom-class="logisticsListDialog"
    >
      <div slot="title" class="title">
        <i class="el-icon-truck"></i>
        <span> 订单物流信息</span>
      </div>
      <el-timeline v-if="logisticsList.length > 0">
        <el-timeline-item icon="el-icon-truck" color="#409EFF">
          快递已开始运送
        </el-timeline-item>
        <el-timeline-item
          v-for="(logistics, index) in logisticsList"
          :key="logistics.logistics_id"
          :timestamp="logistics.create_time | dateFormat"
          color="#67C23A"
        >
          已到达{{ logistics.city_code | cityFormat }}/{{ logistics.location }}
        </el-timeline-item>
        <el-timeline-item> 努力运送中... </el-timeline-item>
        <el-timeline-item :timestamp="new Date() | dateFormat">
          预计今日送达
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="该订单暂无物流信息" />
      <div slot="footer" class="cartonDialogFooter">
        <el-button size="small" @click="logisticsListVisiable = false"
          >关 闭</el-button
        >
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "Order",
  data() {
    return {
      //订单列表
      orderList: [],
      //已选中的订单列表
      orderIdList: [],
      //搜索订单列表的条件
      orderSearch: "",
      //分页所用对象
      page: {
        pageNumber: 1,
        pageSize: 8,
        total: 0,
      },
      //订单的物流信息
      logisticsList: [],
      //订单物流信息dialog可见性
      logisticsListVisiable: false,
    };
  },
  methods: {
    //分页获取所有订单信息
    async getOrders() {
      this.getOrderCountKey();
      const { data: orderListRes } = await this.$http.post("order/infoes", {
        pageNumber: this.page.pageNumber,
        pageSize: this.page.pageSize,
      });
      this.orderList = orderListRes.data;
    },

    //获取条件下所有订单信息数量
    async getOrderCountKey() {
      const { data: orderCountRes } = await this.$http.get("order/count");
      this.page.total = parseInt(orderCountRes.data[0].total);
    },

    //处理页面大小发生变化的方法
    handleSizeChange(newSize) {
      const temporaryTotal = this.page.pageSize * this.page.pageNumber;
      this.page.pageSize = newSize;
      this.page.pageNumber = temporaryTotal / this.page.pageSize + 1;
      this.getOrders();
    },

    //处理当前页码发生变化的方法
    handleCurrentChange(newPage) {
      this.page.pageNumber = newPage;
      this.getOrders();
    },

    //处理列表第一行选择按钮
    handleSelectionChange(value) {
      this.orderIdList = value;
    },

    //删除单个订单信息
    async deleteOrder(order) {
      const { data: deleteOrderRes } = await this.$http.post("order/delete", {
        order_id: order.order_id,
      });
      this.getOrders();
      this.$message({
        message: `${
          deleteOrderRes.code !== 200 ? "删除订单信息失败" : "删除订单信息成功!"
        }`,
        type: `${deleteOrderRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //删除已选中的订单信息行
    deleteSelectedHires() {
      if (this.orderIdList.length <= 0) {
        this.$message({
          message: "请选择订单信息列表行",
          type: "warning",
          center: true,
        });
        return;
      }
      this.$confirm("永久删除这些订单信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(async () => {
          var orderIds = [];
          this.orderIdList.forEach((order) => {
            orderIds.push(order.order_id);
          });
          const { data: deleteOrdersRes } = await this.$http.post(
            "order/deletes",
            {
              orderIds,
            }
          );
          this.getOrders();
          this.$message({
            message: `${
              deleteOrdersRes.code !== 200
                ? "删除订单信息失败"
                : "删除订单信息成功!"
            }`,
            type: `${deleteOrdersRes.code !== 200 ? "error" : "success"}`,
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

    //结束订单(state = 4)
    async finishOrder(order) {
      const { data: finishOrderRes } = await this.$http.post("order/finish", {
        order_id: order.order_id,
      });
      if (finishOrderRes.code === 200) order.state = 4;
      this.$message({
        message: `${
          finishOrderRes.code !== 200 ? "结束订单失败" : "结束订单成功!"
        }`,
        type: `${finishOrderRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //根据订单Id获取该订单的物流信息
    async getLogisticsListByOrderId(order_id) {
      const { data: orderLogisticsListRes } = await this.$http.get(
        "logistics/infoes/" + order_id
      );
      this.logisticsList = orderLogisticsListRes.data;
      for (let i = 0; i < this.logisticsList.length; i++) {
        this.logisticsList[i].city_code =
          this.logisticsList[i].city_code.split("-");
      }
      this.logisticsListVisiable = true;
    },
  },
  mounted() {
    this.getOrders();
  },
};
</script>
