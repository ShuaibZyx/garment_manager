<template>
  <el-card>
    <div class="garment">
      <div class="operation">
        <el-button
          type="danger"
          size="small"
          plain
          @click="deleteSelectedGarments"
          >删除已选中</el-button
        >
        <el-alert
          title="服装信息管理"
          type="success"
          center
          :closable="false"
          style="width: 50%"
        />
        <el-button type="primary" size="small" plain @click="addGarment"
          >添加服装</el-button
        >
      </div>
      <div class="table">
        <el-table
          :data="
            garmentList.filter(
              (data) =>
                !garmentSearch ||
                data.name.toLowerCase().includes(garmentSearch.toLowerCase())
            )
          "
          style="width: 100%"
          fit
          lazy
          :stripe="true"
          :border="true"
          :highlight-current-row="true"
          empty-text="暂无数据"
          ref="userTable"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="expand">
            <template slot-scope="scope">
              <div class="expand_content">
                <el-descriptions title="服装信息" :column="3">
                  <el-descriptions-item label="服装编号">{{
                    scope.row.garment_id
                  }}</el-descriptions-item>
                  <el-descriptions-item label="服装拥有者编号">
                    {{ scope.row.owner_id }}</el-descriptions-item
                  >
                  <el-descriptions-item label="创建时间">
                    {{ scope.row.create_time | dateFormat }}
                  </el-descriptions-item>
                  <el-descriptions-item label="尺码">
                    {{ scope.row.size }}
                  </el-descriptions-item>
                  <el-descriptions-item label="颜色">
                    {{ scope.row.color }}
                  </el-descriptions-item>
                  <el-descriptions-item label="服装详细描述">
                    {{ scope.row.description }}
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

          <el-table-column
            label="服装名称"
            align="center"
            prop="name"
            width="280"
          />

          <el-table-column label="图片" align="center">
            <template slot-scope="scope">
              <el-image
                style="width: 100px; height: 100px"
                :src="scope.row.image_url"
                :preview-src-list="garmentPreviewList"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </template>
          </el-table-column>

          <el-table-column label="服装类别" align="center">
            <template slot-scope="scope">
              <el-tag type="primary">{{ scope.row.category }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="租价" align="center">
            <template slot-scope="scope">
              {{ scope.row.hire_price }}元/天
            </template>
          </el-table-column>

          <el-table-column label="价值" align="center">
            <template slot-scope="scope"> {{ scope.row.value }}元 </template>
          </el-table-column>

          <el-table-column label="租期" align="center">
            <template slot-scope="scope">
              {{ scope.row.hire_time_min }}-{{ scope.row.hire_time_max }}天
            </template>
          </el-table-column>

          <el-table-column label="服装状态" align="center">
            <template slot-scope="scope">
              <el-tag type="primary">{{
                scope.row.state | garmentStateFormat
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column align="center" width="220">
            <template slot="header">
              <el-input
                v-model="garmentSearch"
                size="mini"
                @keyup.enter.native="getGarment"
                @blur="getGarment"
                placeholder="输入服装名称进行搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.state === 1"
                type="primary"
                size="mini"
                plain
                @click="showHireDialog(scope.row)"
                >租赁</el-button
              >
              <el-button
                v-if="scope.row.state === 1"
                type="info"
                size="mini"
                plain
                @click="garmentStateChange(scope.row, '下架')"
                >下架</el-button
              >
              <el-button
                v-if="scope.row.state === 0"
                type="success"
                size="mini"
                plain
                @click="garmentStateChange(scope.row, '上架')"
                >上架</el-button
              >
              <el-popconfirm
                title="确定删除该服装?此操作不可逆"
                style="margin-left: 10px"
                @confirm="deleteUser(scope.row)"
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
            :page-sizes="[4, 6, 12]"
            :page-size="page.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
            background
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 添加租赁信息的Dialog -->
    <el-dialog
      :visible.sync="hireDialogVisiable"
      width="50%"
      :close-on-click-modal="false"
      @close="resetHireForm"
      custom-class="hireFormDialog"
    >
      <div slot="title" class="title">
        <i class="el-icon-edit"></i>
        <span> 租赁服装</span>
      </div>
      <el-descriptions title="服装信息" border>
        <el-descriptions-item label="服装名称" :span="2">{{
          currentHireGarment.name
        }}</el-descriptions-item>
        <el-descriptions-item label="服装图片">
          <el-image
            :src="currentHireGarment.image_url"
            fit="scale-down"
            lazy
            :preview-src-list="currentGarmentImageList"
            style="width: 100px; height: 100px"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="价值"
          ><el-tag size="small"
            >{{ currentHireGarment.value }}元</el-tag
          ></el-descriptions-item
        >
        <el-descriptions-item label="租价"
          ><el-tag size="small"
            >{{ currentHireGarment.hire_price }}元/天</el-tag
          ></el-descriptions-item
        >
        <el-descriptions-item label="可选租期">
          <el-tag size="small"
            >{{ currentHireGarment.hire_time_min }}-{{
              currentHireGarment.hire_time_max
            }}天</el-tag
          >
        </el-descriptions-item>
        <el-descriptions-item label="服装类型">
          <el-tag size="small">{{ currentHireGarment.category }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="尺码"
          ><el-tag size="small">{{
            currentHireGarment.size
          }}</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="颜色"
          ><el-tag size="small">{{
            currentHireGarment.color
          }}</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="服装描述" :span="3">{{
          currentHireGarment.description
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="hireForm">
        <span class="title">租赁信息</span>
        <el-form
          :model="hireForm"
          label-width="auto"
          ref="hireFormRef"
          :rules="hireFormRules"
        >
          <el-form-item label="租赁人" prop="renter_id">
            <el-autocomplete
              placeholder="请输入想要查找的用户账号关键字"
              v-model="queryInfo"
              :fetch-suggestions="searchSuggest"
              class="input-with-select"
              size="small"
              clearable
              autocomplete="on"
              value-key="account"
              :debounce="500"
              @change="hireForm.renter_id = ''"
              @select="handRenterSelect"
              style="width: 100%"
            >
              <i class="el-icon-user" slot="prefix" />
            </el-autocomplete>
          </el-form-item>

          <el-form-item label="租赁天数" prop="day">
            <el-input
              v-model.number="hireForm.day"
              type="number"
              :min="currentHireGarment.hire_time_min"
              :max="currentHireGarment.hire_time_max"
              size="small"
              clearable
              placeholder="租赁天数"
            >
              <i slot="suffix">天</i>
            </el-input>
          </el-form-item>

          <el-form-item label="总价(自动计算)">
            <el-input
              :value="total_price"
              type="number"
              size="small"
              clearable
              readonly
            >
              <i slot="suffix">元</i>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="cartonDialogFooter">
        <el-button size="small" @click="hireDialogVisiable = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="addHire"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "Garment",
  data() {
    return {
      //用户列表
      garmentList: [],
      //已选中的用户列表
      garmentIdList: [],
      //搜索用户列表的条件
      garmentSearch: "",
      //预览服装图片的数组
      garmentPreviewList: [],
      //分页组件所用对象
      page: {
        pageNumber: 1,
        pageSize: 4,
        total: 0,
      },
      //租赁Dialog可见性
      hireDialogVisiable: false,
      //租赁信息表单
      hireForm: {
        day: 7,
        renter_id: "",
        owner_id: "",
        garment_id: "",
        total_price: "",
      },
      //租赁服装表单验证规则
      hireFormRules: {
        renter_id: [
          {
            required: true,
            message: "服装拥有者不能为空",
            trigger: ["blur", "change"],
          },
        ],
        day: [
          {
            required: true,
            message: "租赁天数不能为空",
            trigger: ["blur"],
          },
          {
            max: 365,
            min: 1,
            type: "number",
            trigger: ["blur", "change"],
            message: "租赁期限不符合商品规定",
          },
        ],
      },
      //搜索用户的条件
      queryInfo: "",
      //当前正在租赁的商品信息
      currentHireGarment: {},
      //当前正在租赁的商品图片预览数组
      currentGarmentImageList: [],
    };
  },
  computed: {
    total_price() {
      return this.currentHireGarment.hire_price * this.hireForm.day;
    },
  },
  methods: {
    //获取所有服装信息
    async getGarment() {
      this.getGarmentCountKey();
      this.garmentPreviewList = [];
      const { data: garmentListRes } = await this.$http.post("garment/infoes", {
        pageNumber: this.page.pageNumber,
        pageSize: this.page.pageSize,
        key: this.userSearch,
      });
      this.garmentList = garmentListRes.data;
      this.garmentList.forEach((garment) => {
        this.garmentPreviewList.push(garment.image_url);
      });
    },

    //获取条件下所有用户数量
    async getGarmentCountKey() {
      const { data: garmentCountRes } = await this.$http.get(
        "garment/count/" + this.garmentSearch
      );
      this.page.total = parseInt(garmentCountRes.data[0].total);
    },

    //处理页面大小发生变化的方法
    handleSizeChange(newSize) {
      const temporaryTotal = this.page.pageSize * this.page.pageNumber;
      this.page.pageSize = newSize;
      this.page.pageNumber = temporaryTotal / this.page.pageSize + 1;
      this.getGarment();
    },

    //处理当前页码发生变化的方法
    handleCurrentChange(newPage) {
      this.page.pageNumber = newPage;
      this.getGarment();
    },

    //处理列表第一行选择按钮
    handleSelectionChange(value) {
      this.garmentIdList = value;
    },

    //删除单个服装信息
    async deleteUser(garment) {
      const { data: deleteGarmentRes } = await this.$http.post(
        "garment/delete",
        {
          garment_id: garment.garment_id,
          image_url: garment.image_url,
          file_id: garment.file_id,
        }
      );
      this.getGarment();
      this.$message({
        message: `${
          deleteGarmentRes.code !== 200 ? "删除服装失败" : "删除服装成功!"
        }`,
        type: `${deleteGarmentRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //删除已选中的服装信息行
    deleteSelectedGarments() {
      if (this.garmentIdList.length <= 0) {
        this.$message({
          message: "请选择服装信息列表行",
          type: "warning",
          center: true,
        });
        return;
      }
      this.$confirm("永久删除这些服装, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(async () => {
          var garmentIds = [];
          var fileIds = [];
          this.garmentIdList.forEach((garment) => {
            garmentIds.push(garment.garment_id);
            fileIds.push(garment.file_id);
          });
          const { data: deleteGarmentsRes } = await this.$http.post(
            "garment/deletes",
            {
              garmentIds,
              fileIds,
            }
          );
          this.getGarment();
          this.$message({
            message: `${
              deleteGarmentsRes.code !== 200 ? "删除服装失败" : "删除服装成功!"
            }`,
            type: `${deleteGarmentsRes.code !== 200 ? "error" : "success"}`,
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

    //跳转到添加新用户页面
    addGarment() {
      this.$router.push("/garment/add");
    },

    //服装上架下架切换
    async garmentStateChange(garment, type) {
      const { data: garmentStateChangeRes } = await this.$http.post(
        "garment/state",
        {
          garment_id: garment.garment_id,
          type,
        }
      );
      garment.state = type === "上架" ? 1 : type === "下架" ? 0 : 2;
      this.$message({
        message: `${
          garmentStateChangeRes.code !== 200
            ? "服装状态改变失败!"
            : "服装状态改变成功!"
        }`,
        type: `${garmentStateChangeRes.code !== 200 ? "error" : "success"}`,
        center: true,
      });
    },

    //根据条件获取服装拥有者用户列表
    async searchSuggest(queryString, callback) {
      //定义一个空数组
      var list = [];
      const { data: userSearchRes } = await this.$http.get(
        "user/garment/" + queryString
      );
      //如果获取搜索条件成功，则将条件名推入下拉框数组中
      if (userSearchRes.code === 200) {
        userSearchRes.data.forEach((user) => {
          list.push({
            value: user.user_id,
            account: user.account,
          });
        });
      }
      callback(list);
    },

    //处理选中拥有者的方法
    handRenterSelect(user) {
      this.hireForm.renter_id = user.value;
    },

    //点击租赁展示租赁dialog并存入该行数据
    async showHireDialog(garment) {
      this.currentGarmentImageList = [];
      const { data: garmentRes } = await this.$http.get(
        "garment/info/" + garment.garment_id
      );
      if (garmentRes.code === 200) {
        this.currentHireGarment = garmentRes.data[0];
        this.currentGarmentImageList.push(garmentRes.data[0].image_url);
      }
      this.hireForm.owner_id = garment.owner_id;
      this.hireForm.garment_id = garment.garment_id;
      this.hireFormRules.day[1].max = parseInt(
        this.currentHireGarment.hire_time_max
      );
      this.hireFormRules.day[1].min = parseInt(
        this.currentHireGarment.hire_time_min
      );
      this.hireDialogVisiable = true;
    },

    //新增一条租赁信息
    addHire() {
      this.$refs.hireFormRef.validate(async (valid) => {
        if (!valid) return;
        var hireObj = this.hireForm;
        hireObj.total_price = this.total_price;
        const { data: addHireRes } = await this.$http.post("hire/add", {
          hireObj,
        });
        this.$message({
          message: `${
            addHireRes.code !== 200 ? "租赁服装失败!" : "租赁服装成功!"
          }`,
          type: `${addHireRes.code !== 200 ? "error" : "success"}`,
          center: true,
        });
        this.getGarment();
        this.hireDialogVisiable = false;
      });
    },

    //重置租赁表单
    resetHireForm() {
      this.hireForm.day = 7;
      this.hireForm.renter_id = "";
      this.queryInfo = "";
      this.$refs.hireFormRef.resetFields();
    },
  },
  mounted() {
    this.getGarment();
  },
};
</script>
