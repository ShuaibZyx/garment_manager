<template>
  <el-card>
    <div class="addGarment">
      <div class="title">
        <el-alert
          title="录入新服装"
          type="success"
          center
          :closable="false"
          style="width: 50%"
        />
      </div>
      <el-form
        ref="addGarmentFormRef"
        :model="addGarmentForm"
        :rules="addGarmentFormRules"
        label-width="auto"
      >
        <div class="info">
          <div class="left">
            <el-form-item label="服装名称" prop="name">
              <el-input
                v-model="addGarmentForm.name"
                size="small"
                maxlength="30"
                clearable
                placeholder="服装名称"
              />
            </el-form-item>
            <el-form-item label="封面图片">
              <el-upload
                :class="{
                  hide: garmentCoverFileList.length === 1,
                }"
                accept=".jpeg,.png,.jpg,.bmp,.gif"
                list-type="picture-card"
                :file-list="garmentCoverFileList"
                action
                :http-request="uploadFile"
                :on-change="handleFileChange"
                :auto-upload="false"
                ref="upload"
              >
                <i slot="default" class="el-icon-plus" style="font-size: 0.7em"
                  >封面</i
                >
                <div slot="file" slot-scope="{ file }">
                  <el-image
                    class="el-upload-list__item-thumbnail"
                    :src="file.url"
                    fit="cover"
                  />
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-preview"
                      @click="handlePictureCardPreview(file)"
                    >
                      <i class="el-icon-zoom-in"></i>
                    </span>
                    <span
                      class="el-upload-list__item-delete"
                      @click="handleDownload(file)"
                    >
                      <i class="el-icon-download"></i>
                    </span>
                    <span
                      class="el-upload-list__item-delete"
                      @click="handleRemove()"
                    >
                      <i class="el-icon-delete"></i>
                    </span>
                  </span>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item label="服装拥有者" prop="owner_id">
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
                @change="addGarmentForm.owner_id = ''"
                @select="handOwnerSelect"
                style="width: 100%"
              >
                <i class="el-icon-user" slot="prefix" />
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="服装分类" prop="category">
              <el-select
                v-model="addGarmentForm.category"
                filterable
                size="small"
                clearable
                placeholder="请选择服装类别"
                style="width: 100%"
              >
                <el-option
                  v-for="item in garmentCategory"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="租赁单价" prop="hire_price">
              <el-input
                v-model.number="addGarmentForm.hire_price"
                type="number"
                max="10000000"
                size="small"
                clearable
                placeholder="租赁单价"
              >
                <i slot="suffix">元/天</i>
              </el-input>
            </el-form-item>
          </div>
          <div class="right">
            <el-form-item label="服装价值" prop="value">
              <el-input
                v-model.number="addGarmentForm.value"
                type="number"
                max="10000"
                size="small"
                clearable
                placeholder="服装价值"
              >
                <i slot="suffix">元</i>
              </el-input>
            </el-form-item>
            <el-form-item label="服装尺码" prop="size">
              <el-input
                v-model="addGarmentForm.size"
                size="small"
                maxlength="5"
                clearable
                placeholder="服装尺码(类似XL)"
              />
            </el-form-item>
            <el-form-item label="服装颜色" prop="color">
              <el-input
                v-model="addGarmentForm.color"
                size="small"
                maxlength="10"
                clearable
                placeholder="服装中文颜色"
              />
            </el-form-item>
            <el-form-item label="最短租赁天数" prop="hire_time_min">
              <el-input
                v-model.number="addGarmentForm.hire_time_min"
                type="number"
                min="1"
                size="small"
                clearable
                placeholder="最短租赁天数"
              >
                <i slot="suffix">天</i>
              </el-input>
            </el-form-item>
            <el-form-item label="最长租赁天数" prop="hire_time_max">
              <el-input
                v-model.number="addGarmentForm.hire_time_max"
                type="number"
                max="365"
                size="small"
                clearable
                placeholder="最长租赁天数"
              >
                <i slot="suffix">天</i>
              </el-input>
            </el-form-item>
            <el-form-item label="服装状态" prop="state">
              <el-select
                v-model="addGarmentForm.state"
                filterable
                size="small"
                clearable
                placeholder="请选择服装状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in garmentState"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="desc">
          <el-form-item label="文字描述" prop="description">
            <el-input
              type="textarea"
              placeholder="服装的详细文字描述"
              v-model="addGarmentForm.description"
              maxlength="200"
              size="small"
              show-word-limit
              clearable
              rows="4"
            />
          </el-form-item>
        </div>
        <div class="btns">
          <el-button
            type="info"
            size="medium"
            round
            plain
            icon=" el-icon-close"
            @click="resetAddGarment"
          >
            重置表单
          </el-button>
          <el-button
            type="primary"
            size="medium"
            round
            icon="el-icon-check"
            plain
            @click="upload"
          >
            添加服装
          </el-button>
        </div>
      </el-form>
    </div>
    <!-- 创建新盒子时的图片预览 -->
    <el-dialog :visible.sync="previewImgDialogVisible">
      <img width="100%" :src="previewImageUrl" />
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "AddGarment",
  data() {
    return {
      //添加服装所用表单
      addGarmentForm: {
        name: "",
        category: "T恤",
        description: "",
        hire_price: "",
        value: "",
        owner_id: "",
        size: "",
        color: "",
        file_id: "",
        image_url: "",
        hire_time_min: 1,
        hire_time_max: 7,
        state: 1,
      },
      //添加服装表单验证规则
      addGarmentFormRules: {
        name: [
          {
            required: true,
            message: "服装名称不能为空",
            trigger: "blur",
          },
        ],
        category: [
          {
            required: true,
            message: "服装类别不能为空",
            trigger: ["blur", "change"],
          },
        ],
        hire_price: [
          {
            required: true,
            message: "租赁单价不能为空",
            trigger: "blur",
          },
          {
            type: "number",
            max: 10000,
            message: "租赁单价小于10000元",
            trigger: ["blur", "change"],
          },
        ],
        value: [
          {
            required: true,
            message: "服装价值不能为空",
            trigger: "blur",
          },
          {
            type: "number",
            max: 10000,
            message: "服装价值小于10000元",
            trigger: ["blur", "change"],
          },
        ],
        owner_id: [
          {
            required: true,
            message: "服装拥有者不能为空",
            trigger: ["blur", "change"],
          },
        ],
        size: [
          {
            required: true,
            message: "服装尺码不能为空",
            trigger: "blur",
          },
        ],
        color: [
          {
            required: true,
            message: "服装颜色不能为空",
            trigger: "blur",
          },
        ],
        hire_time_max: [
          {
            required: false,
            type: "number",
            max: 365,
            message: "租赁天数小于365天",
            trigger: ["blur", "change"],
          },
        ],
        state: [
          {
            required: true,
            message: "服装状态不能为空",
            trigger: ["blur", "change"],
          },
        ],
      },
      //可选服装分类
      garmentCategory: [
        { label: "毛衣", value: "毛衣" },
        { label: "卫衣", value: "卫衣" },
        { label: "短外套", value: "短外套" },
        { label: "连衣裙", value: "连衣裙" },
        { label: "休闲裤", value: "休闲裤" },
        { label: "牛仔裤", value: "牛仔裤" },
        { label: "西装", value: "西装" },
        { label: "羽绒服", value: "羽绒服" },
        { label: "T恤", value: "T恤" },
        { label: "旗袍", value: "旗袍" },
        { label: "衬衫", value: "衬衫" },
        { label: "短裤", value: "短裤" },
        { label: "长袖", value: "长袖" },
        { label: "皮裤", value: "皮裤" },
        { label: "棉衣", value: "棉衣" },
        { label: "打底裤", value: "打底裤" },
        { label: "内衣", value: "内衣" },
        { label: "鞋子", value: "鞋子" },
        { label: "袜子", value: "袜子" },
        { label: "马甲", value: "马甲" },
        { label: "睡衣", value: "睡衣" },
        { label: "帽子", value: "帽子" },
        { label: "半身裙", value: "半身裙" },
        { label: "汉服", value: "汉服" },
        { label: "JK", value: "JK" },
        { label: "洛丽塔", value: "洛丽塔" },
        { label: "秋衣", value: "秋衣" },
        { label: "风衣", value: "风衣" },
        { label: "大衣", value: "大衣" },
        { label: "夹克", value: "夹克" },
      ],
      //可选服装状态
      garmentState: [
        { label: "可租赁", value: 1 },
        { label: "已下架", value: 0 },
        { label: "租赁中", value: 2 },
      ],
      //服装封面图片文件绑定数组
      garmentCoverFileList: [],
      //预览上传的图片的dialog弹窗可见性
      previewImgDialogVisible: false,
      //预览所用的图片url
      previewImageUrl: "",
      //搜索用户的条件
      queryInfo: "",
    };
  },
  methods: {
    //自定义上传行为
    uploadFile(file) {
      this.formdata.append("file", file.file);
    },

    //文件/文件列表状态发生改变时触发的方法
    handleFileChange(file) {
      const fileType = file.name.substring(file.name.lastIndexOf("."));
      const typeList = [".jpeg", ".jpg", ".png", ".bmp", ".gif"];
      //文件小于1M
      const size = file.size / 1024 / 1024 < 1;
      if (!typeList.includes(fileType)) {
        this.$message({
          message: "只可选择图片类型文件",
          center: true,
          type: "warning",
        });
        this.$refs.upload.uploadFiles.pop();
        return;
      }
      if (!size) {
        this.$message({
          message: "图片大小不能超过 1MB",
          center: true,
          type: "warning",
        });
        this.$refs.upload.uploadFiles.pop();
        return;
      }
      this.garmentCoverFileList = this.$refs.upload.uploadFiles;
    },

    //处理图片预览
    handlePictureCardPreview(file) {
      this.previewImageUrl = file.url;
      this.previewImgDialogVisible = true;
    },

    //处理图片下载
    handleDownload(file) {
      let tempa = document.createElement("a");
      tempa.href = file.url;
      tempa.download = file.name;
      document.body.append(tempa);
      tempa.click();
      tempa.remove();
    },

    //处理已经上传的图片删除事件
    handleRemove() {
      this.$refs.upload.uploadFiles.pop();
      this.garmentCoverFileList.pop();
    },

    //重置新增服装表单
    resetAddGarment() {
      Object.keys(this.addGarmentForm).forEach(
        (key) => (this.addGarmentForm[key] = "")
      );
      this.$refs.upload.uploadFiles.pop();
      this.addGarmentForm.hire_time_min = 1;
      this.addGarmentForm.hire_time_max = 7;
      this.addGarmentForm.state = 1;
      this.queryInfo = "";
      this.$refs.addGarmentFormRef.resetFields();
      this.$message({
        message: "重置成功!请重新输入",
        type: "success",
        center: true,
      });
    },

    //新增服装的方法(封面文件)
    upload() {
      if (this.$refs.upload.uploadFiles.length === 0) {
        this.$message.warning("请上传服装封面");
        return;
      }
      this.$refs.addGarmentFormRef.validate(async (valid) => {
        if (!valid) return;
        this.formdata = new FormData();
        this.$refs.upload.submit();
        await this.$http.post("file/upload", this.formdata).then(({ data }) => {
          this.addGarmentForm.file_id = data.file.fileId;
          this.addGarmentForm.image_url = data.file.fileUrl;
          this.addGarment();
        });
      });
    },

    //新增服装方法(数据库字段)
    async addGarment() {
      var garmentObj = {};
      Object.assign(garmentObj, this.addGarmentForm);
      const { data: addUserRes } = await this.$http.post("garment/add", {
        garmentObj,
      });
      this.$refs.addGarmentFormRef.resetFields();
      Object.keys(this.addGarmentForm).forEach(
        (key) => (this.addGarmentForm[key] = "")
      );
      this.$refs.upload.uploadFiles.pop();
      this.garmentCoverFileList.pop();
      this.$message({
        message: `${
          addUserRes.code !== 200 ? "添加服装失败" : "添加服装成功!"
        }`,
        type: `${addUserRes.code !== 200 ? "error" : "success"}`,
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
            account: `${user.account}(${user.nickname})`,
          });
        });
      }
      callback(list);
    },

    //处理选中拥有者的方法
    handOwnerSelect(user) {
      this.addGarmentForm.owner_id = user.value;
    },
  },
};
</script>
