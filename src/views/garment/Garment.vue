<template>
  <el-card>
    <div class="garment">
      <div class="operation">
        <el-button type="danger" size="small" plain @click="deleteSelectedGarments">删除已选中</el-button>
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
                <span>价值: {{ scope.row.value }}</span>
                <span>尺码: {{ scope.row.size }}</span>
                <span>颜色: {{ scope.row.color }}</span>
                <span>创建时间: {{ scope.row.create_time | dateFormat }}</span>
                <span>更新时间: {{ scope.row.update_time | dateFormat }}</span>
                <span>服装详细描述: {{ scope.row.description }}</span>
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
              {{ scope.row.hire_price }}元
            </template>
          </el-table-column>

          <el-table-column label="租期" align="center">
            <template slot-scope="scope">
              {{ scope.row.hire_time_min }}天-{{ scope.row.hire_time_max }}天
            </template>
          </el-table-column>

          <el-table-column label="服装状态" align="center">
            <template slot-scope="scope">
              <el-tag type="primary">{{
                scope.row.state | garmentStateFormat
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column align="center" width="240">
            <template slot="header">
              <el-input
                v-model="garmentSearch"
                size="mini"
                placeholder="输入服装名称搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                @click="showEditUserDialog(scope.row)"
                >编辑</el-button
              >
              <el-popconfirm
                title="确定删除该服装?此操作不可逆"
                style="margin-left: 5px"
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
      page: {
        pageNumber: 1,
        pageSize: 4,
        total: 0,
      },
    };
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
  },
  mounted() {
    this.getGarment();
  },
};
</script>

<style lang="less">
.garment {
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .operation {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 15px 0;
  }
  .table {
    width: 100%;
    .page {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-top: 10px;
    }
    .expand_content {
      width: 100%;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      font-family: 微软雅黑;
      span {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
